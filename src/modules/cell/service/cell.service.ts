import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class CellService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        return this.prisma.cell.findMany({ orderBy: { name: 'asc' }, include: { leader: true } });
    }

    public async create(name: string, leaderUserId?: number, discipuladoId?: number) {
        return this.prisma.cell.create({ data: { name, leaderUserId, discipuladoId } });
    }

    public async findById(id: number) {
        return this.prisma.cell.findUnique({ where: { id }, include: { leader: true } });
    }

    public async update(id: number, data: { name?: string; leaderUserId?: number }) {
        return this.prisma.cell.update({ where: { id }, data });
    }

    /**
     * Multiply (split) a cell: create a new cell and move specified members from the original cell
     */
    public async multiply(
        originalCellId: number,
        memberIds: number[],
        newCellName: string,
        newLeaderUserId?: number,
        oldLeaderUserId?: number,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const original = await tx.cell.findUnique({ where: { id: originalCellId } });
            if (!original) {
                throw new NotFoundException('Original cell not found');
            }

            if (oldLeaderUserId && original.leaderUserId !== oldLeaderUserId) {
                throw new BadRequestException('Old leader does not match');
            }

            // create new cell
            const newCell = await tx.cell.create({ data: { name: newCellName, leaderUserId: newLeaderUserId, discipuladoId: original.discipuladoId } });

            // ensure members belong to the original cell
            const validMembers = await tx.member.findMany({ where: { id: { in: memberIds }, cellId: originalCellId } });
            const validIds = validMembers.map(m => m.id);

            if (validIds.length === 0) {
                throw new BadRequestException('No provided members belong to the original cell');
            }

            await tx.member.updateMany({ where: { id: { in: validIds } }, data: { cellId: newCell.id } });

            return {
                newCell,
                movedCount: validIds.length,
                movedMemberIds: validIds
            };
        });
    }

}
