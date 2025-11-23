import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MemberService } from '../service/member.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard, hasCellAccessDb } from '../../common/security/permission.guard';
import { PrismaService } from '../../common';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { MemberInput } from '../model/member.input';

@Controller()
@ApiTags('membros')
export class MemberController {
    constructor(private readonly service: MemberService, private readonly prisma: PrismaService) {}

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Get('cells/:cellId/members')
    public async list(@Req() req: AuthenticatedRequest, @Param('cellId') cellIdParam: string) {
        const permission = (req as any).permission;
        const cellId = Number(cellIdParam);
        const ok = await hasCellAccessDb(this.prisma, permission, cellId);
        if (!ok) throw new ForbiddenException('No access to this cell');

        return this.service.findActiveByCell(cellId);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Post('cells/:cellId/members')
    @ApiOperation({ summary: 'Criar membro na célula' })
    @ApiBody({ type: MemberInput })
    @ApiResponse({ status: 201, description: 'Membro criado' })
    public async create(@Req() req: AuthenticatedRequest, @Param('cellId') cellIdParam: string, @Body() body: MemberInput) {
        const permission = (req as any).permission;
        const cellId = Number(cellIdParam);
        const ok = await hasCellAccessDb(this.prisma, permission, cellId);
        if (!ok) throw new ForbiddenException('No access to this cell');

        return this.service.create(cellId, body.name);
    }

    @UseGuards(RestrictedGuard, PermissionGuard)
    @Delete('members/:memberId')
    @ApiOperation({ summary: 'Inativar/excluir membro' })
    @ApiResponse({ status: 200, description: 'Membro inativado' })
    public async remove(@Req() req: AuthenticatedRequest, @Param('memberId') memberIdParam: string) {
        const permission = (req as any).permission;
        const memberId = Number(memberIdParam);
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });
        if (!member) throw new ForbiddenException('Member not found');
        const ok = await hasCellAccessDb(this.prisma, permission, member.cellId);
        if (!ok) throw new ForbiddenException('No access to this cell');

        return this.service.inactivate(memberId);
    }

}
