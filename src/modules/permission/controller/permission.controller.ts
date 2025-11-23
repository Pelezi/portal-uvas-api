import { Controller, UseGuards, Get, Req, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard, requireCanManagePermissions } from '../../common/security/permission.guard';
import { PermissionService } from '../service/permission.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { PermissionUpsertInput } from '../model/permission.input';

@UseGuards(RestrictedGuard, PermissionGuard)
@Controller('permissions')
@ApiTags('permissions')
export class PermissionController {
    constructor(private readonly service: PermissionService) {}

    @Get()
    public async list(@Req() req: AuthenticatedRequest) {
        const permission = (req as any).permission;
        requireCanManagePermissions(permission);

        return this.service.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Criar ou atualizar permissão de usuário' })
    @ApiBody({ type: PermissionUpsertInput })
    @ApiResponse({ status: 200, description: 'Permissão criada/atualizada' })
    public async upsert(@Req() req: AuthenticatedRequest, @Body() body: PermissionUpsertInput) {
        const permission = (req as any).permission;
        requireCanManagePermissions(permission);

        return this.service.createOrUpdate(body.email, body.cellIds || [], !!body.hasGlobalCellAccess, !!body.canManageCells, !!body.canManagePermissions);
    }

    @Delete(':id')
    public async remove(@Req() req: AuthenticatedRequest, @Param('id') idParam: string) {
        const permission = (req as any).permission;
        requireCanManagePermissions(permission);
        const id = Number(idParam);
        return this.service.remove(id);
    }

}
