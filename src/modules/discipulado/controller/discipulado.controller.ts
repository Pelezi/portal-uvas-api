import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { DiscipuladoService } from '../service/discipulado.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import * as DiscipuladoData from '../model';

@UseGuards(RestrictedGuard, PermissionGuard)
@Controller('discipulados')
@ApiTags('discipulados')
@ApiBearerAuth()
export class DiscipuladoController {
    constructor(private readonly service: DiscipuladoService) {}

    @Get()
    public async list(
        @Req() req: AuthenticatedRequest,
    @Query() filters: DiscipuladoData.DiscipuladoFilterInput
    ) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }

        if (!!!filters.all && (!filters.discipuladoIds || filters.discipuladoIds.length === 0) && !permission.isAdmin) {
            // Se all for false e discipuladoIds não for fornecido, usar os discipulados do próprio usuário
            filters.discipuladoIds = permission.discipuladoIds;
        }

        return this.service.findAll(req.member.matrixId, req.member.id, filters);
    }

    @Post()
    @ApiOperation({ summary: 'Criar discipulado' })
    @ApiBody({ type: DiscipuladoData.DiscipuladoCreateInput })
    @ApiResponse({ status: 201, description: 'Discipulado criado' })
    public async create(@Req() req: AuthenticatedRequest, @Body() body: DiscipuladoData.DiscipuladoCreateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.create({ ...body, matrixId: req.member!.matrixId }, permission);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar discipulado' })
    public async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: DiscipuladoData.DiscipuladoCreateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.update(Number(id), body as any, req.member!.matrixId, permission);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir discipulado' })
    public async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.delete(Number(id), permission);
    }
}
