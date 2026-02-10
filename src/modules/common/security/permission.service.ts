import { Injectable } from '@nestjs/common';
import { PrismaService } from '../provider/prisma.provider';
import { $Enums } from '../../../generated/prisma/client';

export interface LoadedPermission {
    id: number;
    isAdmin: boolean;
    ministryType: $Enums.MinistryType | null;
    ministryPositionId: number | null;
    celulaIds: number[];
    congregacaoIds: number[];
    redeIds: number[];
    discipuladoIds: number[];
}

export interface SimplifiedPermission {
    id: number;
    viceLeader: boolean;
    leader: boolean;
    discipulador: boolean;
    pastor: boolean;
    pastorCongregacao: boolean;
    pastorPresidente: boolean;
    ministryType: $Enums.MinistryType | null;
    isAdmin: boolean;
    celulaIds: number[] | null;
}

@Injectable()
export class PermissionService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Loads complete permission data for a member
     * This is the single source of truth for permission calculation
     */
    async loadPermissionForMember(memberId: number): Promise<LoadedPermission | null> {
        const dbMember = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                redes: true,
                discipulados: true,
                ledCelulas: true,
                viceLedCelulas: true,
                congregacoesPastorGoverno: true,
                congregacoesVicePresidente: true,
                ministryPosition: true,
                roles: {
                    include: { role: true }
                }
            }
        });

        if (!dbMember) {
            return null;
        }

        // Compute celula ids where member has explicit roles (leader/vice/discipulador/pastor)
        const leaderCelulaIds = (dbMember.ledCelulas || []).map(c => c.id);
        const viceCelulaIds = (dbMember.viceLedCelulas || []).map(c => c.id);

        // Discipulados owned
        const discipuladoIds = (dbMember.discipulados || []).map(d => d.id);

        // Redes (pastor)
        const redeIds = (dbMember.redes || []).map(r => r.id);

        // Congregacoes (pastor de governo ou vice presidente)
        const congregacaoIdsPastor = (dbMember.congregacoesPastorGoverno || []).map(c => c.id);
        const congregacaoIdsVice = (dbMember.congregacoesVicePresidente || []).map(c => c.id);
        const congregacaoIds = Array.from(new Set([...congregacaoIdsPastor, ...congregacaoIdsVice]));

        // Gather celulas that belong to redes or discipulados the member owns
        const celulasFromRede = await this.prisma.celula.findMany({
            where: { discipulado: { rede: { pastorMemberId: dbMember.id } } }
        }).catch(() => []);

        const celulasFromDiscipulado = await this.prisma.celula.findMany({
            where: { discipulado: { discipuladorMemberId: dbMember.id } }
        }).catch(() => []);

        const extraCelulaIds = [
            ...(celulasFromRede || []).map(c => c.id),
            ...(celulasFromDiscipulado || []).map(c => c.id)
        ];

        const celulaIds = Array.from(new Set([...leaderCelulaIds, ...viceCelulaIds, ...extraCelulaIds]));

        // Check if member has admin role
        const isAdmin = dbMember.roles?.some(mr => mr.role.isAdmin) ?? false;

        return {
            id: dbMember.id,
            isAdmin,
            ministryType: dbMember.ministryPosition?.type ?? null,
            ministryPositionId: dbMember.ministryPositionId,
            celulaIds,
            congregacaoIds,
            redeIds,
            discipuladoIds
        };
    }

    /**
     * Loads simplified permission data (used for login response)
     */
    async loadSimplifiedPermissionForMember(memberId: number): Promise<SimplifiedPermission | null> {
        const permission = await this.loadPermissionForMember(memberId);
        
        if (!permission) {
            return null;
        }

        const dbMember = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                ledCelulas: true,
                viceLedCelulas: true,
                discipulados: true,
                redes: true,
                congregacoesPastorGoverno: true,
                congregacoesVicePresidente: true
            }
        });

        if (!dbMember) {
            return null;
        }

        return {
            id: dbMember.id,
            viceLeader: ((dbMember.viceLedCelulas || []).length > 0) || permission.ministryType === $Enums.MinistryType.LEADER_IN_TRAINING,
            leader: ((dbMember.ledCelulas || []).length > 0) || permission.ministryType === $Enums.MinistryType.LEADER,
            discipulador: ((dbMember.discipulados || []).length > 0) || permission.ministryType === $Enums.MinistryType.DISCIPULADOR,
            pastor: ((dbMember.redes || []).length > 0) || permission.ministryType === $Enums.MinistryType.PASTOR,
            pastorCongregacao: ((dbMember.congregacoesPastorGoverno || []).length > 0) || ((dbMember.congregacoesVicePresidente || []).length > 0),
            pastorPresidente: permission.ministryType === $Enums.MinistryType.PRESIDENT_PASTOR,
            ministryType: permission.ministryType,
            isAdmin: permission.isAdmin,
            celulaIds: permission.celulaIds.length ? permission.celulaIds : null
        };
    }

    /**
     * Check if member has access to a specific celula
     */
    hasCelulaAccess(permission: LoadedPermission | null | undefined, celulaId: number): boolean {
        if (!permission) return false;
        if (permission.isAdmin) return true;
        return (permission.celulaIds || []).includes(celulaId);
    }

    /**
     * Check if member is leader of a specific celula
     */
    async isCelulaLeader(memberId: number, celulaId: number): Promise<boolean> {
        const celula = await this.prisma.celula.findUnique({ where: { id: celulaId } });
        if (!celula) return false;
        return !!celula.leaderMemberId && celula.leaderMemberId === memberId;
    }

    /**
     * Check if member is discipulador for a celula
     */
    async isDiscipuladorForCelula(
        permission: LoadedPermission | null | undefined,
        celulaId: number
    ): Promise<boolean> {
        if (!permission) return false;
        
        const celula = await this.prisma.celula.findUnique({
            where: { id: celulaId },
            include: { discipulado: true }
        });
        
        if (!celula || !celula.discipulado) return false;
        
        return celula.discipulado.discipuladorMemberId === permission.id ||
            (permission.discipuladoIds || []).includes(celula.discipulado.id);
    }

    /**
     * Check if member is pastor for a celula
     */
    async isPastorForCelula(
        permission: LoadedPermission | null | undefined,
        celulaId: number
    ): Promise<boolean> {
        if (!permission) return false;
        
        const celula = await this.prisma.celula.findUnique({
            where: { id: celulaId },
            include: { discipulado: { include: { rede: true } } }
        });
        
        if (!celula || !celula.discipulado || !celula.discipulado.rede) return false;
        
        return celula.discipulado.rede.pastorMemberId === permission.id ||
            (permission.redeIds || []).includes(celula.discipulado.rede.id);
    }

    /**
     * Check if member has management rights for a celula
     * (Admin, Pastor, Discipulador, Leader, or Vice-Leader)
     */
    async hasManageRightsForCelula(
        permission: LoadedPermission | null | undefined,
        memberId: number,
        celulaId: number
    ): Promise<boolean> {
        if (!permission) return false;
        if (permission.isAdmin) return true;

        // Pastor da rede
        if (await this.isPastorForCelula(permission, celulaId)) return true;

        // Discipulador do discipulado que contém a célula
        if (await this.isDiscipuladorForCelula(permission, celulaId)) return true;

        // O líder da célula
        if (await this.isCelulaLeader(memberId, celulaId)) return true;

        // O líder em treinamento da célula
        const celula = await this.prisma.celula.findUnique({ where: { id: celulaId } });
        if (celula && celula.viceLeaderMemberId && celula.viceLeaderMemberId === memberId) {
            return true;
        }

        // Fallback: if the celula is in user's computed celulaIds
        if ((permission.celulaIds || []).includes(celulaId)) return true;

        return false;
    }

    /**
     * Require admin permission (throws if not admin)
     */
    requireAdmin(permission: LoadedPermission | null | undefined): void {
        if (!permission || !permission.isAdmin) {
            throw new Error('Admin permission required');
        }
    }
}
