import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete, Put, Query, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MemberService } from '../service/member.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { PermissionService } from '../../common/security/permission.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { FileUploadInterceptor } from '../../common/flow/file-upload.interceptor';
import * as MemberData from '../model';

@Controller('members')
@ApiTags('membros')
@UseGuards(RestrictedGuard, PermissionGuard)
@ApiBearerAuth()
export class MemberController {
    constructor(
        private readonly service: MemberService,
        private readonly permissionService: PermissionService
    ) { }

    @Get('statistics')
    @ApiOperation({ summary: 'Buscar estatísticas dos membros' })
    @ApiResponse({ status: 200, description: 'Estatísticas dos membros' })
    public async getStatistics(
        @Req() req: AuthenticatedRequest,
        @Query() filters: MemberData.StatisticsFilterInput
    ) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID is required', HttpStatus.BAD_REQUEST);
        }
        return this.service.getStatistics(filters, req.member.matrixId, req.permission);
    }

    @Get(':memberId')
    @ApiOperation({ summary: 'Buscar membro por ID' })
    @ApiResponse({ status: 200, description: 'Dados do membro' })
    @ApiResponse({ status: 404, description: 'Membro não encontrado' })
    public async getById(@Param('memberId') memberIdParam: string) {
        const memberId = Number(memberIdParam);
        const member = await this.service.findById(memberId);
        if (!member) throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        return member;
    }

    @Get('')
    @ApiOperation({ summary: 'Listar todos os membros com filtros opcionais' })
    @ApiResponse({ status: 200, description: 'Lista de membros' })
    public async listAll(
        @Req() req: AuthenticatedRequest,
        @Query() filters: MemberData.MemberFilterInput
    ) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.findAll(req.member.matrixId, req.member.id, filters);
    }

    @Get('celulas/:celulaId/members')
    public async list(@Req() req: AuthenticatedRequest, @Param('celulaId') celulaIdParam: string) {
        const permission = req.permission;
        const celulaId = Number(celulaIdParam);

        const celulaAccess = await this.permissionService.hasCelulaAccess(permission, celulaId);
        if (!celulaAccess) {
            throw new HttpException('Você não tem acesso a esta célula', HttpStatus.UNAUTHORIZED);
        }

        return this.service.findByCelula(celulaId);
    }

    @Post('')
    @ApiOperation({ summary: 'Criar membro' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: MemberData.MemberInput })
    @ApiResponse({ status: 201, description: 'Membro criado' })
    @UseInterceptors(FileUploadInterceptor)
    public async createWithoutCelula(
        @Req() req: AuthenticatedRequest,
        @Body() body: MemberData.MemberInput
    ) {
        const permission = req.permission;

        // Validar que usuário tem permissão para criar membros (admin ou líder)
        if (!this.permissionService.canCreateMember(permission)) {
            throw new HttpException('Você não tem permissão para criar membros', HttpStatus.UNAUTHORIZED);
        }

        // Se não for admin e está atribuindo a uma célula, validar acesso à célula
        if (!permission.isAdmin && body.celulaId) {
            const celulaAccess = await this.permissionService.hasCelulaAccess(permission, body.celulaId);
            if (!celulaAccess) {
                throw new HttpException('Você não tem acesso a esta célula', HttpStatus.UNAUTHORIZED);
            }
        }

        if (!req.member) {
            throw new HttpException('Requisição não autenticada', HttpStatus.UNAUTHORIZED);
        }

        const photo = req.uploadedFile;

        return this.service.create(body, req.member.matrixId, req.member.id, photo);
    }

    @Delete(':memberId')
    @ApiOperation({ summary: 'Remover membro da célula' })
    @ApiResponse({ status: 200, description: 'Membro removido da célula' })
    public async remove(@Req() req: AuthenticatedRequest, @Param('memberId') memberIdParam: string) {
        const permission = req.permission;
        const memberId = Number(memberIdParam);
        const member = await this.service.findById(memberId);

        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (member.celulaId) {
            const celulaAccess = await this.permissionService.hasCelulaAccess(permission, member.celulaId);
            if (!celulaAccess) {
                throw new HttpException('Você não tem acesso a esta célula', HttpStatus.UNAUTHORIZED);
            }
        }

        return this.service.removeFromCelula(memberId);
    }

    @Put(':memberId')
    @ApiOperation({ summary: 'Atualizar membro' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: MemberData.MemberInput })
    @ApiQuery({ name: 'deletePhoto', required: false, description: 'Se "true", deleta a foto do membro' })
    @ApiResponse({ status: 200, description: 'Membro atualizado' })
    @UseInterceptors(FileUploadInterceptor)
    public async update(
        @Req() req: AuthenticatedRequest,
        @Param('memberId') memberIdParam: string,
        @Body() body: MemberData.MemberInput,
        @Query('deletePhoto') deletePhoto?: string
    ) {
        const permission = req.permission;
        const memberId = Number(memberIdParam);
        const member = await this.service.findById(memberId);

        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (member.celulaId) {
            const celulaAccess = await this.permissionService.hasCelulaAccess(permission, member.celulaId);
            if (!celulaAccess) {
                throw new HttpException('Você não tem acesso a esta célula', HttpStatus.UNAUTHORIZED);
            }
        }

        if (!req.member) {
            throw new HttpException('Requisição não autenticada', HttpStatus.UNAUTHORIZED);
        }

        const photo = req.uploadedFile;

        return this.service.update(memberId, body, req.member.matrixId, req.member.id, photo, deletePhoto);
    }

    @Get('profile/me')
    @ApiOperation({ summary: 'Obter perfil do usuário logado' })
    @ApiResponse({ status: 200, description: 'Perfil do usuário' })
    public async getOwnProfile(@Req() req: AuthenticatedRequest) {
        if (!req.member) {
            throw new HttpException('Requisição não autenticada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.getOwnProfile(req.member.id);
    }

    @Put('profile/password')
    @ApiOperation({ summary: 'Atualizar senha do usuário logado' })
    @ApiResponse({ status: 200, description: 'Senha atualizada' })
    public async updateOwnPassword(
        @Req() req: AuthenticatedRequest,
        @Body() body: { currentPassword: string; newPassword: string }
    ) {
        if (!req.member) {
            throw new HttpException('Requisição não autenticada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.updateOwnPassword(req.member.id, body.currentPassword, body.newPassword);
    }

    @Put('profile/email')
    @ApiOperation({ summary: 'Atualizar email do usuário logado' })
    @ApiResponse({ status: 200, description: 'Email atualizado' })
    public async updateOwnEmail(
        @Req() req: AuthenticatedRequest,
        @Body() body: { email: string }
    ) {
        if (!req.member) {
            throw new HttpException('Requisição não autenticada', HttpStatus.UNAUTHORIZED);
        }
        return this.service.updateOwnEmail(req.member.id, body.email);
    }

    @Put('profile/me')
    @ApiOperation({ summary: 'Atualizar perfil do usuário logado (dados pessoais e endereço)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: MemberData.UpdateOwnProfileInput })
    @ApiQuery({ name: 'deletePhoto', required: false, description: 'Se "true", deleta a foto do membro' })
    @ApiResponse({ status: 200, description: 'Perfil atualizado' })
    @UseInterceptors(FileUploadInterceptor)
    public async updateOwnProfile(
        @Req() req: AuthenticatedRequest,
        @Body() body: MemberData.UpdateOwnProfileInput,
        @Query('deletePhoto') deletePhoto?: string
    ) {
        if (!req.member) {
            throw new HttpException('Requisição não autenticada', HttpStatus.UNAUTHORIZED);
        }
        
        const photo = req.uploadedFile;
        const shouldDeletePhoto = deletePhoto === 'true';
        
        return this.service.updateOwnProfile(req.member.id, body, photo, shouldDeletePhoto);
    }

    @Post('set-password')
    public async setPassword(@Body() body: { token: string; password: string }) {
        return this.service.setPasswordWithToken(body.token, body.password);
    }

    @Post(':memberId/send-invite')
    @ApiOperation({ summary: 'Enviar convite inicial para membro' })
    @ApiResponse({ status: 200, description: 'Convite enviado' })
    public async sendInvite(
        @Req() req: AuthenticatedRequest,
        @Param('memberId') memberIdParam: string
    ) {
        const permission = req.permission;
        const memberId = Number(memberIdParam);

        // Verificar permissão (admin ou líder da célula do membro)
        const member = await this.service.findById(memberId);
        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (member.celulaId) {
            const celulaAccess = await this.permissionService.hasCelulaAccess(permission, member.celulaId);
            if (!celulaAccess) {
                throw new HttpException('Você não tem permissão para enviar convite para este membro', HttpStatus.UNAUTHORIZED);
            }
        }

        return this.service.sendInvite(memberId, req.member!.matrixId);
    }

    @Post(':memberId/resend-invite')
    @ApiOperation({ summary: 'Reenviar convite para membro' })
    @ApiResponse({ status: 200, description: 'Convite reenviado' })
    public async resendInvite(
        @Req() req: AuthenticatedRequest,
        @Param('memberId') memberIdParam: string
    ) {
        const permission = req.permission;
        const memberId = Number(memberIdParam);

        // Verificar permissão (admin ou líder da célula do membro)
        const member = await this.service.findById(memberId);
        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (member.celulaId) {
            const celulaAccess = await this.permissionService.hasCelulaAccess(permission, member.celulaId);
            if (!celulaAccess) {
                throw new HttpException('Você não tem permissão para reenviar convite para este membro', HttpStatus.UNAUTHORIZED);
            }
        }

        return this.service.resendInvite(memberId, req.member!.matrixId);
    }

    @Get('with-roles')
    @ApiOperation({ summary: 'Listar membros com informações de roles' })
    @ApiResponse({ status: 200, description: 'Lista de membros com roles' })
    public async listWithRoles(@Req() req: AuthenticatedRequest) {
        if (!req.member?.matrixId) {
            throw new HttpException('Matrix ID não encontrado', HttpStatus.UNAUTHORIZED);
        }

        return this.service.findAllWithRoles(req.member.matrixId);
    }

}
