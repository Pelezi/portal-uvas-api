import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { CongregacaoService } from '../service/congregacao.service';
import { CongregacaoCreateInput, CongregacaoUpdateInput } from '../model/congregacao.input';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@UseGuards(RestrictedGuard, PermissionGuard)
@Controller('congregacoes')
@ApiTags('congregacoes')
export class CongregacaoController {
    constructor(private readonly service: CongregacaoService) {}

    @Get()
    @ApiOperation({ summary: 'Listar congregações' })
    public async list(@Req() req: AuthenticatedRequest) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }
        const permission = req.permission;
        return this.service.findAll(req.member.matrixId, permission);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar congregação por ID' })
    public async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }
        return this.service.findOne(Number(id), req.member.matrixId, req.permission);
    }

    @Post()
    @ApiOperation({ summary: 'Criar congregação' })
    @ApiBody({ type: CongregacaoCreateInput })
    @ApiResponse({ status: 201, description: 'Congregação criada' })
    public async create(@Req() req: AuthenticatedRequest, @Body() body: CongregacaoCreateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.create({ ...body, matrixId: req.member!.matrixId }, permission);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar congregação' })
    @ApiBody({ type: CongregacaoUpdateInput })
    public async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CongregacaoUpdateInput) {
        const permission = req.permission;
        if (!permission) {
            throw new HttpException('Permissão não encontrada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.update(Number(id), body, req.member!.matrixId, permission);
    }

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
