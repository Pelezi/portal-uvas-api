import { Controller, Post, Body, UseGuards, Req, Param, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from '../service/report.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { PermissionService } from '../../common/security/permission.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import * as ReportData from '../model';

@Controller('celulas/:celulaId/reports')
@ApiTags('reports')
@ApiBearerAuth()
export class ReportController {
    constructor(
        private readonly service: ReportService,
        private readonly permissionService: PermissionService
    ) { }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Post()
    @ApiOperation({ summary: 'Criar relatório para a célula' })
    @ApiBody({ type: ReportData.ReportCreateInput })
    @ApiResponse({ status: 201, description: 'Relatório criado' })
    public async create(@Req() req: AuthenticatedRequest, @Param('celulaId') celulaIdParam: string, @Body() body: ReportData.ReportCreateInput) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a essa célula', HttpStatus.UNAUTHORIZED);
        }

        return this.service.create(celulaId, body.memberIds || [], req.member!.matrixId, body.date, body.type, body.offerAmount);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get()
    public async list(@Req() req: AuthenticatedRequest, @Param('celulaId') celulaIdParam: string) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a essa célula', HttpStatus.UNAUTHORIZED);
        }

        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.findByCelula(celulaId, req.member.matrixId);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get('presences')
    @ApiOperation({ summary: 'Relatório de presenças da célula' })
    public async presences(@Req() req: AuthenticatedRequest, @Param('celulaId') celulaIdParam: string) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a essa célula', HttpStatus.UNAUTHORIZED);
        }

        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.presences(celulaId, req.member.matrixId);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get('dates')
    @ApiOperation({ summary: 'Obter todas as datas com relatórios da célula' })
    @ApiResponse({
        status: 200,
        description: 'Retorna objeto com arrays de datas para CELULA e CULTO',
        schema: {
            type: 'object',
            properties: {
                celulaDates: { type: 'array', items: { type: 'string', format: 'date' } },
                cultoDates: { type: 'array', items: { type: 'string', format: 'date' } }
            }
        }
    })
    public async getReportDates(
        @Req() req: AuthenticatedRequest,
        @Param('celulaId') celulaIdParam: string
    ) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a essa célula', HttpStatus.UNAUTHORIZED);
        }

        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.getReportDatesByCelula(celulaId, req.member.matrixId);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get('check')
    @ApiOperation({ summary: 'Verificar se existe relatório para uma data e tipo' })
    @ApiQuery({ name: 'date', required: true, description: 'Data no formato YYYY-MM-DD' })
    @ApiQuery({ name: 'type', required: true, enum: ['CELULA', 'CULTO'] })
    public async checkReport(
        @Req() req: AuthenticatedRequest,
        @Param('celulaId') celulaIdParam: string,
        @Query('date') date: string,
        @Query('type') type: 'CELULA' | 'CULTO'
    ) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a essa célula', HttpStatus.UNAUTHORIZED);
        }

        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        const report = await this.service.findByDateAndType(celulaId, date, type, req.member.matrixId);
        return { exists: !!report, report };
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get('by-month/:year/:month')
    @ApiOperation({ summary: 'Relatórios por mês com presentes e ausentes' })
    public async reportsByMonth(
        @Req() req: AuthenticatedRequest,
        @Param('celulaId') celulaIdParam: string,
        @Param('year') yearParam: string,
        @Param('month') monthParam: string
    ) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);
        const year = Number(yearParam);
        const month = Number(monthParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a essa célula', HttpStatus.UNAUTHORIZED);
        }

        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.reportsByMonth(celulaId, year, month, req.member.matrixId);
    }

}

@Controller('reports')
@ApiTags('reports')
export class ReportGlobalController {
    constructor(
        private readonly service: ReportService
    ) { }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get('by-filter/:year/:month')
    @ApiOperation({ summary: 'Relatórios por congregação, rede, discipulado ou células' })
    public async reportsByFilter(
        @Req() req: AuthenticatedRequest,
        @Param('year') yearParam: string,
        @Param('month') monthParam: string,
        @Query() filters: ReportData.ReportFilterInput
    ) {
        const permission = req.permission;
        const year = Number(yearParam);
        const month = Number(monthParam);

        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.reportsByMonthMultipleCelulas(
            permission,
            year,
            month,
            filters,
            req.member.matrixId
        );
    }

}
