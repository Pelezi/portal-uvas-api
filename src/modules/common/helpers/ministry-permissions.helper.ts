import { $Enums } from '../../../generated/prisma/client';
import { PrismaService } from '../provider/prisma.provider';

/**
 * Helper functions to check permissions based on ministry type
 */

export function canBePastor(ministryType?: $Enums.MinistryType | null): boolean {
    if (!ministryType) return false;
    return (
        ministryType === $Enums.MinistryType.PRESIDENT_PASTOR ||
        ministryType === $Enums.MinistryType.PASTOR
    );
}

export function canBeDiscipulador(ministryType?: $Enums.MinistryType | null): boolean {
    if (!ministryType) return false;
    return (
        ministryType === $Enums.MinistryType.PRESIDENT_PASTOR ||
        ministryType === $Enums.MinistryType.PASTOR ||
        ministryType === $Enums.MinistryType.DISCIPULADOR
    );
}

export function canBeLeader(ministryType?: $Enums.MinistryType | null): boolean {
    if (!ministryType) return false;
    return (
        ministryType === $Enums.MinistryType.PRESIDENT_PASTOR ||
        ministryType === $Enums.MinistryType.PASTOR ||
        ministryType === $Enums.MinistryType.DISCIPULADOR ||
        ministryType === $Enums.MinistryType.LEADER ||
        ministryType === $Enums.MinistryType.LEADER_IN_TRAINING ||
        ministryType === $Enums.MinistryType.MEMBER
    );
}

export function canBeLeaderInTraining(ministryType?: $Enums.MinistryType | null): boolean {
    if (!ministryType) return false;
    return (
        ministryType === $Enums.MinistryType.PRESIDENT_PASTOR ||
        ministryType === $Enums.MinistryType.PASTOR ||
        ministryType === $Enums.MinistryType.DISCIPULADOR ||
        ministryType === $Enums.MinistryType.LEADER ||
        ministryType === $Enums.MinistryType.LEADER_IN_TRAINING
    );
}

export function getMinistryTypeLabel(type?: $Enums.MinistryType | null): string {
    const labels: Record<$Enums.MinistryType, string> = {
        [$Enums.MinistryType.PRESIDENT_PASTOR]: 'Pastor Presidente',
        [$Enums.MinistryType.PASTOR]: 'Pastor',
        [$Enums.MinistryType.DISCIPULADOR]: 'Discipulador',
        [$Enums.MinistryType.LEADER]: 'Líder',
        [$Enums.MinistryType.LEADER_IN_TRAINING]: 'Líder em Treinamento',
        [$Enums.MinistryType.MEMBER]: 'Membro',
        [$Enums.MinistryType.REGULAR_ATTENDEE]: 'Frequentador Assíduo',
        [$Enums.MinistryType.VISITOR]: 'Visitante',
    };
    return type ? labels[type] : 'Membro';
}

/**
 * Get minimum required ministry type for a specific role
 */
export function getMinimumMinistryTypeFor(role: 'pastor' | 'discipulador' | 'leader' | 'leaderInTraining'): $Enums.MinistryType {
    const requirements = {
        pastor: $Enums.MinistryType.PASTOR,
        discipulador: $Enums.MinistryType.DISCIPULADOR,
        leader: $Enums.MinistryType.LEADER,
        leaderInTraining: $Enums.MinistryType.LEADER_IN_TRAINING,
    };
    return requirements[role];
}

/**
 * Automatically promotes a member to the minimum required ministry type for a role if needed.
 * Returns true if the member was promoted, false if no promotion was needed.
 * 
 * @param prisma - PrismaService instance
 * @param memberId - ID of the member to check/promote
 * @param role - The role the member is being assigned to
 * @param matrixId - Matrix ID to find the appropriate ministry position
 * @returns Promise<boolean> - true if promoted, false if already had sufficient level
 */
export async function autoPromoteMemberIfNeeded(
    prisma: PrismaService,
    memberId: number,
    role: 'pastor' | 'discipulador' | 'leader' | 'leaderInTraining',
    matrixId: number
): Promise<boolean> {
    // Get the member with their current ministry position in this matrix
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
            ministryPositions: {
                where: { matrixId },
                include: { ministry: true }
            }
        }
    });

    if (!member) {
        throw new Error('Member not found');
    }

    const currentMinistryType = member.ministryPositions?.[0]?.ministry?.type;
    const requiredMinistryType = getMinimumMinistryTypeFor(role);

    // Check if promotion is needed
    let needsPromotion = false;
    
    if (!currentMinistryType) {
        needsPromotion = true;
    } else {
        // Define hierarchy order (lower number = higher rank)
        const hierarchy: Record<$Enums.MinistryType, number> = {
            [$Enums.MinistryType.PRESIDENT_PASTOR]: 1,
            [$Enums.MinistryType.PASTOR]: 2,
            [$Enums.MinistryType.DISCIPULADOR]: 3,
            [$Enums.MinistryType.LEADER]: 4,
            [$Enums.MinistryType.LEADER_IN_TRAINING]: 5,
            [$Enums.MinistryType.MEMBER]: 6,
            [$Enums.MinistryType.REGULAR_ATTENDEE]: 7,
            [$Enums.MinistryType.VISITOR]: 8,
        };

        const currentRank = hierarchy[currentMinistryType];
        const requiredRank = hierarchy[requiredMinistryType];

        // If current rank is higher number (lower position), needs promotion
        needsPromotion = currentRank > requiredRank;
    }

    if (!needsPromotion) {
        return false; // Already has sufficient level
    }

    // Find the ministry position with the required type in the member's matrix
    const targetMinistry = await prisma.ministry.findFirst({
        where: {
            matrixId: matrixId,
            type: requiredMinistryType
        }
    });

    if (!targetMinistry) {
        throw new Error(`Ministry position of type ${requiredMinistryType} not found in matrix ${matrixId}`);
    }

    // Delete existing ministry position for this matrix and create new one
    await prisma.memberMinistry.deleteMany({
        where: {
            memberId: memberId,
            matrixId: matrixId
        }
    });

    await prisma.memberMinistry.create({
        data: {
            memberId: memberId,
            ministryId: targetMinistry.id,
            matrixId: matrixId
        }
    });

    return true; // Member was promoted
}
