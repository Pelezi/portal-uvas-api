import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';
import { PrismaService } from '../provider/prisma.provider';

export interface LoadedPermission {
    id: number;
    userId: number;
    hasGlobalCellAccess: boolean;
    canManageCells: boolean;
    canManagePermissions: boolean;
    role: 'USER' | 'ADMIN' | 'PASTOR' | 'DISCIPULADOR' | 'LEADER';
}

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const user = request.user;
        if (!user || !user.userId) {
            return false;
        }

        const permission = await this.prisma.permission.findUnique({ where: { userId: user.userId } });
        if (!permission) {
            throw new HttpException('Você não tem permissão para acessar essa tela', HttpStatus.BAD_REQUEST);
        }

        // Load scoped assignments (networks / discipulados)
        const networks = await this.prisma.permissionNetwork.findMany({ where: { permissionId: permission.id } });
        const discipulados = await this.prisma.permissionDiscipulado.findMany({ where: { permissionId: permission.id } });

        // Attach permission and scopes to request for downstream use
        (request as any).permission = permission as LoadedPermission;
        (request as any).permissionNetworks = networks.map(n => n.networkId);
        (request as any).permissionDiscipulados = discipulados.map(d => d.discipuladoId);

        return true;
    }

}

/** Helper checks using DB when required */
export async function isCellLeaderDb(prisma: PrismaService, userId: number, cellId: number): Promise<boolean> {
    const c = await prisma.cell.findUnique({ where: { id: cellId } });
    if (!c) return false;
    return !!c.leaderUserId && c.leaderUserId === userId;
}

export async function isDiscipuladorForCellDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, cellId: number): Promise<boolean> {
    if (!permission) return false;
    // fetch cell -> discipulado -> check permissionDiscipulado
    const cell = await prisma.cell.findUnique({ where: { id: cellId } });
    if (!cell || !cell.discipuladoId) return false;
    const pd = await prisma.permissionDiscipulado.findFirst({ where: { permissionId: permission.id, discipuladoId: cell.discipuladoId } });
    return !!pd;
}

export async function isPastorForCellDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, cellId: number): Promise<boolean> {
    if (!permission) return false;
    const cell = await prisma.cell.findUnique({ where: { id: cellId }, include: { discipulado: true } });
    if (!cell || !cell.discipulado) return false;
    const networkId = cell.discipulado.networkId;
    const pn = await prisma.permissionNetwork.findFirst({ where: { permissionId: permission.id, networkId } });
    return !!pn;
}

export async function hasManageRightsForCellDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, userId: number, cellId: number): Promise<boolean> {
    if (!permission) return false;
    if (permission.hasGlobalCellAccess) return true;
    if (permission.role === 'ADMIN') return true;
    // Pastor of the network
    if (await isPastorForCellDb(prisma, permission, cellId)) return true;
    // Discipulador for discipulado that contains the cell
    if (await isDiscipuladorForCellDb(prisma, permission, cellId)) return true;
    // The leader of the cell (only limited actions like responding reports / adding members)
    const isLeader = await isCellLeaderDb(prisma, userId, cellId);
    if (isLeader) return true;

    // fallback to explicit boolean flag
    if (permission.canManageCells) return true;

    return false;
}

export function hasCellAccess(permission: LoadedPermission | null | undefined, cellId: number): boolean {
    if (!permission) return false;
    if (permission.hasGlobalCellAccess) return true;
    // We need to check permission_cells table — but callers can rely on helper below to query DB
    return false;
}

export async function hasCellAccessDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, cellId: number): Promise<boolean> {
    if (!permission) return false;
    if (permission.hasGlobalCellAccess) return true;
    const pc = await prisma.permissionCell.findFirst({ where: { permissionId: permission.id, cellId } });
    return !!pc;
}

export function requireCanManageCells(permission: LoadedPermission | null | undefined) {
    if (!permission || !permission.canManageCells) {
        throw new ForbiddenException('Requires canManageCells');
    }
}

export function requireCanManagePermissions(permission: LoadedPermission | null | undefined) {
    if (!permission || !permission.canManagePermissions) {
        throw new ForbiddenException('Requires canManagePermissions');
    }
}
