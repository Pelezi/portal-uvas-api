import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CellService } from '../service/cell.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard, hasCellAccessDb, requireCanManageCells } from '../../common/security/permission.guard';
import { PrismaService } from '../../common';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { CellCreateInput, CellUpdateInput, CellMultiplyInput } from '../model/cell.input';

@Controller('cells')
@ApiTags('cells')
export class CellController {
    constructor(private readonly service: CellService, private readonly prisma: PrismaService) {}

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get()
    public async find(@Req() req: AuthenticatedRequest) {
        const permission = (req as any).permission;
        if (permission.hasGlobalCellAccess) {
            return this.service.findAll();
        }

        // find cells linked to permission and include leader relation
        const pcs = await this.prisma.permissionCell.findMany({ where: { permissionId: permission.id } });
        const cellIds = pcs.map(p => p.cellId);
        if (cellIds.length === 0) return [];
        return this.prisma.cell.findMany({ where: { id: { in: cellIds } }, include: { leader: true }, orderBy: { name: 'asc' } });
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Post()
    @ApiOperation({ summary: 'Criar uma nova célula' })
    @ApiBody({ type: CellCreateInput })
    @ApiResponse({ status: 201, description: 'Célula criada' })
    public async create(@Req() req: AuthenticatedRequest, @Body() body: CellCreateInput) {
        const permission = (req as any).permission;
        // Only users with management rights at appropriate scope can create cells.
        requireCanManageCells(permission);

        return this.service.create(body.name, body.leaderUserId, body.discipuladoId);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get(':id')
    public async get(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        const permission = (req as any).permission;
        const cellId = Number(id);
        const ok = await hasCellAccessDb(this.prisma, permission, cellId);
        if (!ok) throw new ForbiddenException('No access to this cell');

        return this.service.findById(cellId);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Atualizar célula' })
    @ApiBody({ type: CellUpdateInput })
    @ApiResponse({ status: 200, description: 'Célula atualizada' })
    public async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CellUpdateInput) {
        const permission = (req as any).permission;
        requireCanManageCells(permission);
        const cellId = Number(id);
        const ok = await hasCellAccessDb(this.prisma, permission, cellId);
        if (!ok) throw new ForbiddenException('No access to this cell');

        return this.service.update(cellId, body as any);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Post(':id/multiply')
    @ApiOperation({ summary: 'Multiplicar (dividir) uma célula: cria nova célula e move membros selecionados' })
    @ApiBody({ type: CellMultiplyInput })
    @ApiResponse({ status: 201, description: 'Célula multiplicada e membros movidos' })
    public async multiply(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CellMultiplyInput) {
        const permission = (req as any).permission;
        requireCanManageCells(permission);
        const cellId = Number(id);
        const ok = await hasCellAccessDb(this.prisma, permission, cellId);
        if (!ok) throw new ForbiddenException('No access to this cell');

        return this.service.multiply(cellId, body.memberIds, body.newCellName, body.newLeaderUserId, body.oldLeaderUserId);
    }

}
