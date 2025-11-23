import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class PermissionService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        return this.prisma.permission.findMany({ include: { user: true, permissionCells: { include: { cell: true } } } });
    }

    public async createOrUpdate(email: string, cellIds: number[], hasGlobalCellAccess: boolean, canManageCells: boolean, canManagePermissions: boolean) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }

        const existing = await this.prisma.permission.findUnique({ where: { userId: user.id } });

        if (existing) {
            // update
            await this.prisma.permission.update({ where: { id: existing.id }, data: { hasGlobalCellAccess, canManageCells, canManagePermissions } });
            // update permissionCells: simple approach: delete all and recreate
            await this.prisma.permissionCell.deleteMany({ where: { permissionId: existing.id } });
            if (!hasGlobalCellAccess && cellIds.length > 0) {
                const rows = cellIds.map(cid => ({ permissionId: existing.id, cellId: cid }));
                await this.prisma.permissionCell.createMany({ data: rows });
            }
            return this.findById(existing.id);
        }

        const created = await this.prisma.permission.create({ data: { userId: user.id, hasGlobalCellAccess, canManageCells, canManagePermissions } });
        if (!hasGlobalCellAccess && cellIds.length > 0) {
            const rows = cellIds.map(cid => ({ permissionId: created.id, cellId: cid }));
            await this.prisma.permissionCell.createMany({ data: rows });
        }

        return this.findById(created.id);
    }

    public async findById(id: number) {
        return this.prisma.permission.findUnique({ where: { id }, include: { user: true, permissionCells: { include: { cell: true } } } });
    }

    public async remove(id: number) {
        await this.prisma.permissionCell.deleteMany({ where: { permissionId: id } });
        return this.prisma.permission.delete({ where: { id } });
    }

}
