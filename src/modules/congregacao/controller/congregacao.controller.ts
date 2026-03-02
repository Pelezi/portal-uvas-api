import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete, HttpException, HttpStatus, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { CongregacaoService } from '../service/congregacao.service';
import * as CongregacaoData from '../model';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@Controller('congregacoes')
@ApiTags('congregacoes')
@ApiBearerAuth()
export class CongregacaoController {
    constructor(private readonly service: CongregacaoService) { }

    @Get('public/find-congregacoes')
    @ApiOperation({ summary: 'Buscar congregações para exibição pública (sem autenticação)' })
    @ApiResponse({ status: 200, description: 'Congregações públicas listadas' })
    public async findPublic(
        @Headers('origin') origin: string,
        @Query('lat') lat?: string,
        @Query('lng') lng?: string,
        @Query('limit') limit?: string
    ) {
        const latitude = lat ? parseFloat(lat) : undefined;
        const longitude = lng ? parseFloat(lng) : undefined;
        const maxResults = limit ? parseInt(limit) : 50;

        return this.service.findPublicCongregacoes(origin, latitude, longitude, maxResults);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get()
    @ApiOperation({ summary: 'Listar congregações' })
    @ApiResponse({ status: 200, description: 'Congregações listadas' })
    public async list(
        @Req() req: AuthenticatedRequest,
        @Query() filters: CongregacaoData.CongregacaoFilterInput
    ) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }
        const permission = req.permission;

        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }

        return this.service.findAll(req.member.matrixId, req.member.id, filters);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Buscar congregação por ID' })
    public async getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }
        return this.service.getById(Number(id), req.member.matrixId, req.permission);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Post()
    @ApiOperation({ summary: 'Criar congregação' })
    @ApiBody({ type: CongregacaoData.CongregacaoCreateInput })
    @ApiResponse({ status: 201, description: 'Congregação criada' })
    public async create(@Req() req: AuthenticatedRequest, @Body() body: CongregacaoData.CongregacaoCreateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.create({ ...body, matrixId: req.member!.matrixId }, permission);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Atualizar congregação' })
    @ApiBody({ type: CongregacaoData.CongregacaoUpdateInput })
    public async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CongregacaoData.CongregacaoUpdateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.update(Number(id), body, req.member!.matrixId, permission);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Excluir congregação' })
    public async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.delete(Number(id), req.member!.matrixId, permission);
    }
}
