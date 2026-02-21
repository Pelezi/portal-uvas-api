import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { RedeService } from '../service/rede.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import * as RedeData from '../model';

@UseGuards(RestrictedGuard, PermissionGuard)
@Controller('redes')
@ApiTags('redes')
@ApiBearerAuth()
export class RedeController {
    constructor(private readonly service: RedeService) {}

    @Get()
    @ApiOperation({ summary: 'Listar redes' })
    @ApiResponse({ status: 200, description: 'Redes listadas' })
    public async list(
        @Req() req: AuthenticatedRequest,
        @Query() filters: RedeData.RedeFilterInput
    ) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }

        if (!!!filters.all && (!filters.redeIds || filters.redeIds.length === 0) && !permission.isAdmin) {
            // Se all for false e redeIds não for fornecido, usar os redes do próprio usuário
            filters.redeIds = permission.redeIds;
        }

        return this.service.findAll(req.member.matrixId, filters);
    }

    @Post()
    @ApiOperation({ summary: 'Criar rede' })
    @ApiBody({ type: RedeData.RedeCreateInput })
    @ApiResponse({ status: 201, description: 'Rede criada' })
    public async create(@Req() req: AuthenticatedRequest, @Body() body: RedeData.RedeCreateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.create({ ...body, matrixId: req.member!.matrixId }, permission);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar rede' })
    public async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: RedeData.RedeCreateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.update(Number(id), body as any, req.member!.matrixId, permission);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir rede' })
    public async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.delete(Number(id), permission);
    }
}
