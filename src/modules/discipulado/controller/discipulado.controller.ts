import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { DiscipuladoService } from '../service/discipulado.service';
import { DiscipuladoCreateInput } from '../model/discipulado.input';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@UseGuards(RestrictedGuard)
@Controller('discipulados')
@ApiTags('discipulados')
export class DiscipuladoController {
    constructor(private readonly service: DiscipuladoService) {}

    @Get()
    public async list(@Req() req: AuthenticatedRequest) {
        return this.service.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Criar discipulado' })
    @ApiBody({ type: DiscipuladoCreateInput })
    @ApiResponse({ status: 201, description: 'Discipulado criado' })
    public async create(@Req() req: AuthenticatedRequest, @Body() body: DiscipuladoCreateInput) {
        return this.service.create(body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar discipulado' })
    public async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: DiscipuladoCreateInput) {
        return this.service.update(Number(id), body as any);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir discipulado' })
    public async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.service.delete(Number(id));
    }
}
