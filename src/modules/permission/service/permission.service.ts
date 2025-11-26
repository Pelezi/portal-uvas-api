import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class PermissionService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        // Return users with admin flag and their basic relations
        const users = await this.prisma.user.findMany({ include: { ledCelulas: true, viceLedCelulas: true, discipulados: true, redes: true } });
        return users.map(u => ({
            user: u,
            admin: u.admin,
            celulaIds: Array.from(new Set([ ...(u.ledCelulas || []).map(c => c.id), ...(u.viceLedCelulas || []).map(c => c.id) ]))
        }));
    }

    public async createOrUpdate(email: string, celulaIds: number[], hasGlobalCelulaAccess: boolean, canManageCelulas: boolean, canManagePermissions: boolean) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');

        // For now, map canManagePermissions -> admin flag on user
        await this.prisma.user.update({ where: { id: user.id }, data: { admin: !!canManagePermissions } });
        // We ignore celulaIds and other legacy flags in the new schema version
        return { OK: true } as any;
    }

    public async findById(id: number) {
        // Return user with computed celula ids
        const u = await this.prisma.user.findUnique({ where: { id }, include: { ledCelulas: true, viceLedCelulas: true } });
        if (!u) return null;
        return { user: u, admin: u.admin, celulaIds: Array.from(new Set([ ...(u.ledCelulas || []).map(c => c.id), ...(u.viceLedCelulas || []).map(c => c.id) ])) };
    }

    public async remove(id: number) {
        // Interpret remove as demoting admin on the associated user id
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error('User not found');
        await this.prisma.user.update({ where: { id: user.id }, data: { admin: false } });
        return true;
    }

}
