import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';
import { PrismaService } from '../provider/prisma.provider';

export interface LoadedPermission {
    id: number;
    userId: number;
    admin: boolean;
    role: string | null;
    celulaIds: number[];
    redeIds: number[];
    discipuladoIds: number[];
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

        const dbUser = await this.prisma.user.findUnique({ where: { id: user.userId }, include: { redes: true, discipulados: true, ledCelulas: true, viceLedCelulas: true } });
        if (!dbUser) {
            throw new HttpException('Você não tem permissão para acessar essa tela', HttpStatus.BAD_REQUEST);
        }

        // compute celula ids where user has explicit roles (leader/vice/discipulador/pastor)
        // leader/vice
        const leaderCelulaIds = (dbUser.ledCelulas || []).map(c => c.id);
        const viceCelulaIds = (dbUser.viceLedCelulas || []).map(c => c.id);

        // discipulados owned
        const discipuladoIds = (dbUser.discipulados || []).map(d => d.id);

        // redes (pastor)
        const redeIds = (dbUser.redes || []).map(r => r.id);

        // gather celulas that belong to redes or discipulados the user owns
        const celulasFromRede = await this.prisma.celula.findMany({ where: { discipulado: { rede: { pastorUserId: dbUser.id } } } }).catch(() => []);
        const celulasFromDiscipulado = await this.prisma.celula.findMany({ where: { discipulado: { discipuladorUserId: dbUser.id } } }).catch(() => []);

        const extraCelulaIds = [ ...(celulasFromRede || []).map(c => c.id), ...(celulasFromDiscipulado || []).map(c => c.id) ];

        const celulaIds = Array.from(new Set([ ...leaderCelulaIds, ...viceCelulaIds, ...extraCelulaIds ]));

        const permission: LoadedPermission = {
            id: dbUser.id,
            userId: dbUser.id,
            admin: !!dbUser.admin,
            role: dbUser.role || null,
            celulaIds,
            redeIds,
            discipuladoIds
        };

        (request as any).permission = permission;
        (request as any).permissionRede = redeIds;
        (request as any).permissionDiscipulados = discipuladoIds;

        return true;
    }

}

/** Helper checks using DB when required */
export async function isCelulaLeaderDb(prisma: PrismaService, userId: number, celulaId: number): Promise<boolean> {
    const c = await prisma.celula.findUnique({ where: { id: celulaId } });
    if (!c) return false;
    return !!c.leaderUserId && c.leaderUserId === userId;
}

export async function isDiscipuladorForCelulaDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, celulaId: number): Promise<boolean> {
    if (!permission) return false;
    const celula = await prisma.celula.findUnique({ where: { id: celulaId }, include: { discipulado: true } });
    if (!celula || !celula.discipulado) return false;
    return celula.discipulado.discipuladorUserId === permission.userId || (permission.discipuladoIds || []).includes(celula.discipulado.id);
}

export async function isPastorForCelulaDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, celulaId: number): Promise<boolean> {
    if (!permission) return false;
    const celula = await prisma.celula.findUnique({ where: { id: celulaId }, include: { discipulado: { include: { rede: true } } } });
    if (!celula || !celula.discipulado || !celula.discipulado.rede) return false;
    return celula.discipulado.rede.pastorUserId === permission.userId || (permission.redeIds || []).includes(celula.discipulado.rede.id);
}

export async function hasManageRightsForCelulaDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, userId: number, celulaId: number): Promise<boolean> {
    if (!permission) return false;
    if (permission.admin) return true;
    // Pastor of the network
    if (await isPastorForCelulaDb(prisma, permission, celulaId)) return true;
    // Discipulador for discipulado that contains the celula
    if (await isDiscipuladorForCelulaDb(prisma, permission, celulaId)) return true;
    // The leader or vice-leader of the celula
    const isLeader = await isCelulaLeaderDb(prisma, userId, celulaId);
    if (isLeader) return true;
    const cel = await prisma.celula.findUnique({ where: { id: celulaId } });
    if (cel && cel.viceLeaderUserId && cel.viceLeaderUserId === userId) return true;

    // fallback: if the celula is in user's computed celulaIds
    if ((permission.celulaIds || []).includes(celulaId)) return true;

    return false;
}

export function hasCelulaAccess(permission: LoadedPermission | null | undefined, celulaId: number): boolean {
    if (!permission) return false;
    if (permission.admin) return true;
    return (permission.celulaIds || []).includes(celulaId);
}

export async function hasCelulaAccessDb(prisma: PrismaService, permission: LoadedPermission | null | undefined, celulaId: number): Promise<boolean> {
    if (!permission) return false;
    if (permission.admin) return true;
    return (permission.celulaIds || []).includes(celulaId);
}

export function requireCanManagePermissions(permission: LoadedPermission | null | undefined) {
    if (!permission || !permission.admin) {
        throw new ForbiddenException('Requires admin');
    }
}
