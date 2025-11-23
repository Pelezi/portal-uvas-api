import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from '../../common';
import { Role } from '../../tokens';
import { UserData, UserInput, LoginInput } from '../model';
import { EmailService } from '../../common/provider/email.provider';

@Injectable()
export class UserService {

    private readonly saltRounds = 10;

    public constructor(
        private readonly prismaService: PrismaService
        ,
        private readonly emailService?: EmailService
    ) { }

    /**
     * Find all users in the database
     *
     * @returns A user list
     */
    public async find(): Promise<UserData[]> {

        const users = await this.prismaService.user.findMany({ include: { permission: true } });

        return users.map(user => new UserData(user));
    }

    /**
     * Find a user by ID
     *
     * @param id User ID
     * @returns A user or null
     */
    public async findById(id: number): Promise<UserData | null> {

        const user = await this.prismaService.user.findUnique({
            where: { id }
        });

        if (!user) {
            return null;
        }

        return new UserData(user);
    }

    /**
     * Create a new user record
     *
     * @param data User details
     * @returns A user created in the database
     */
    public async create(data: UserInput): Promise<UserData> {

        const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

        const user = await this.prismaService.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName
            }
        });

        return new UserData(user);
    }

    /**
     * Create an invited user (email only). Password stays null until user sets it.
     */
    public async inviteUser(email: string, firstName?: string, lastName?: string) {
        // if exists, do not recreate
        let existing = await this.prismaService.user.findUnique({ where: { email } });
        if (existing) return new UserData(existing);

        const user = await this.prismaService.user.create({ data: { email, firstName: firstName || '', lastName: lastName || '' } });

        // generate a token for set-password
        const token = jwt.sign({ userId: user.id, purpose: 'set-password' }, process.env.JWT_SECRET || 'secret', { expiresIn: '48h', issuer: process.env.JWT_ISSUER || 'IssuerApplication' });

        const frontend = process.env.FRONTEND_URL || 'http://localhost:3005';
        const link = `${frontend}/auth/set-password?token=${token}`;

        try {
            await this.emailService?.sendInviteEmail(email, link, `${firstName || ''} ${lastName || ''}`);
        } catch (err) {
            console.error('Failed to send invite email', err);
            throw new HttpException('Failed to send invite email', 500);
        }

        return new UserData(user);
    }

    /**
     * Set password using invite token
     */
    public async setPasswordWithToken(token: string, password: string): Promise<UserData> {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret', { issuer: process.env.JWT_ISSUER || 'IssuerApplication' }) as any;
            if (!payload || payload.purpose !== 'set-password') throw new Error('Invalid token');
            const userId = payload.userId as number;
            const hashed = await bcrypt.hash(password, this.saltRounds);
            const user = await this.prismaService.user.update({ where: { id: userId }, data: { password: hashed, firstAccess: false } });
            return new UserData(user);
        } catch (err) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Send a set-password email for existing user (request from user)
     */
    public async requestSetPassword(email: string) {
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');

        const token = jwt.sign({ userId: user.id, purpose: 'set-password' }, process.env.JWT_SECRET || 'secret', { expiresIn: '48h', issuer: process.env.JWT_ISSUER || 'IssuerApplication' });
        const frontend = process.env.FRONTEND_URL || 'http://localhost:3005';
        const link = `${frontend}/auth/set-password?token=${token}`;

        try {
            await this.emailService?.sendInviteEmail(email, link, `${user.firstName || ''} ${user.lastName || ''}`);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to send set-password email', err);
        }

        return true;
    }

    /**
     * Authenticate a user and return a JWT token
     *
     * @param data Login credentials
     * @returns JWT token and user data
     */
    public async login(data: LoginInput): Promise<{ token: string; user: UserData; permission?: { id: number; hasGlobalCellAccess: boolean; canManageCells: boolean; canManagePermissions: boolean; cellIds: number[] | null } | null }> {

        const user = await this.prismaService.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.password) {
            // user was invited and hasn't set a password yet
            // generate a temporary token and return a set-password link so frontend can redirect immediately
            const token = jwt.sign({ userId: user.id, purpose: 'set-password' }, process.env.JWT_SECRET || 'secret', { expiresIn: '48h', issuer: process.env.JWT_ISSUER || 'IssuerApplication' });
            const frontend = process.env.FRONTEND_URL || 'http://localhost:3005';
            const link = `${frontend}/auth/set-password?token=${token}`;
            return { setPasswordUrl: link } as any;
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: Role.RESTRICTED
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h', issuer: process.env.JWT_ISSUER || 'IssuerApplication' }
        );

        return {
            token,
            user: new UserData(user),
            permission: await this.loadPermissionForUser(user.id)
        };
    }

    private async loadPermissionForUser(userId: number) {
        const permission = await this.prismaService.permission.findUnique({ where: { userId }, include: { permissionCells: true } });
        if (!permission) return null;
        const cellIds = (permission.permissionCells || []).map(pc => (pc as any).cellId).filter(Boolean) as number[];
        return {
            id: permission.id,
            hasGlobalCellAccess: permission.hasGlobalCellAccess,
            canManageCells: permission.canManageCells,
            canManagePermissions: permission.canManagePermissions,
            cellIds: cellIds.length ? cellIds : null
        };
    }

    /**
     * Return the logged user data and permissions (no token)
     */
    public async me(userId: number): Promise<{ user: UserData; permission?: { id: number; hasGlobalCellAccess: boolean; canManageCells: boolean; canManagePermissions: boolean; cellIds: number[] | null } | null }> {
        const user = await this.findById(userId);
        if (!user) throw new Error('User not found');
        const permission = await this.loadPermissionForUser(userId);
        return { user, permission };
    }

    /**
     * Update any user's basic profile (admin/perm only)
     */
    public async updateUser(userId: number, data: { firstName?: string; lastName?: string; phoneNumber?: string; timezone?: string }) {
        const user = await this.prismaService.user.update({ where: { id: userId }, data: {
            ...(data.firstName !== undefined && { firstName: data.firstName }),
            ...(data.lastName !== undefined && { lastName: data.lastName }),
            ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
            ...(data.timezone !== undefined && { timezone: data.timezone }),
        } });
        return new UserData(user);
    }

    /**
     * Delete a user by ID
     */
    public async deleteUser(userId: number) {
        // consider cascade or restrictions in DB; here we do a simple delete
        await this.prismaService.user.delete({ where: { id: userId } });
        return true;
    }

    /**
     * Mark user's first access as complete
     *
     * @param userId User ID
     * @returns Updated user data
     */
    public async completeFirstAccess(userId: number): Promise<UserData> {
        const user = await this.prismaService.user.update({
            where: { id: userId },
            data: { firstAccess: false }
        });

        return new UserData(user);
    }

    /**
     * Update user profile
     *
     * @param userId User ID
     * @param data Profile data to update
     * @returns Updated user data
     */
    public async updateProfile(userId: number, data: { timezone?: string; phoneNumber?: string }): Promise<UserData> {
        const user = await this.prismaService.user.update({
            where: { id: userId },
            data: {
                ...(data.timezone && { timezone: data.timezone }),
                ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber })
            }
        });

        return new UserData(user);
    }

    /**
     * Search users by email
     *
     * @param email Email search term
     * @returns List of users matching the search
     */
    public async searchByEmailOrName(query: string): Promise<UserData[]> {
        const users = await this.prismaService.user.findMany({
            where: {
                OR: [
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        firstName: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            take: 10,
            orderBy: {
                email: 'asc'
            }
        });

        return users.map(user => new UserData(user));
    }

    /**
     * Get user by id including permission object
     */
    public async getByIdWithPermission(userId: number): Promise<{ user: UserData; permission?: { id: number; hasGlobalCellAccess: boolean; canManageCells: boolean; canManagePermissions: boolean; cellIds: number[] | null } | null }> {
        const user = await this.findById(userId);
        if (!user) throw new Error('User not found');
        const permission = await this.loadPermissionForUser(userId);
        return { user, permission };
    }

}
