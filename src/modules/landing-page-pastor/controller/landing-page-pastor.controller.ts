import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LandingPagePastorService } from '../service/landing-page-pastor.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { PermissionService } from '../../common/security/permission.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { LandingPagePastorData } from '../dto/landing-page-pastor.dto';

@Controller('landing-page-pastors')
@ApiTags('landing-page-pastors')
@UseGuards(RestrictedGuard, PermissionGuard)
@ApiBearerAuth()
export class LandingPagePastorController {
  constructor(
    private readonly landingPagePastorService: LandingPagePastorService,
    private readonly permissionService: PermissionService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar um pastor à landing page' })
  @ApiResponse({ status: 201, description: 'Pastor adicionado com sucesso' })
  public async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: LandingPagePastorData.CreateLandingPagePastorInput
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    // Check permission
    const hasPermission = await this.permissionService.canManageLandingPagePastors(req.member!.id);
    if (!hasPermission) {
      throw new HttpException(
        'Você não tem permissão para gerenciar pastores da landing page',
        HttpStatus.FORBIDDEN
      );
    }

    return this.landingPagePastorService.create(matrixId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pastores configurados na landing page' })
  @ApiResponse({ status: 200, description: 'Lista de pastores retornada com sucesso' })
  public async list(@Req() req: AuthenticatedRequest) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.landingPagePastorService.list(matrixId);
  }

  @Get('eligible')
  @ApiOperation({ summary: 'Listar todos os membros elegíveis (pastores) para adicionar à landing page' })
  @ApiResponse({ status: 200, description: 'Lista de pastores elegíveis retornada com sucesso' })
  public async getEligiblePastors(@Req() req: AuthenticatedRequest) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.landingPagePastorService.getEligiblePastors(matrixId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um pastor da landing page' })
  @ApiParam({ name: 'id', description: 'ID da entrada do pastor', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pastor atualizado com sucesso' })
  public async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: LandingPagePastorData.UpdateLandingPagePastorInput
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    // Check permission
    const hasPermission = await this.permissionService.canManageLandingPagePastors(req.member!.id);
    if (!hasPermission) {
      throw new HttpException(
        'Você não tem permissão para gerenciar pastores da landing page',
        HttpStatus.FORBIDDEN
      );
    }

    return this.landingPagePastorService.update(parseInt(id, 10), matrixId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pastor da landing page' })
  @ApiParam({ name: 'id', description: 'ID da entrada do pastor', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pastor removido com sucesso' })
  public async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    // Check permission
    const hasPermission = await this.permissionService.canManageLandingPagePastors(req.member!.id);
    if (!hasPermission) {
      throw new HttpException(
        'Você não tem permissão para gerenciar pastores da landing page',
        HttpStatus.FORBIDDEN
      );
    }

    await this.landingPagePastorService.delete(parseInt(id, 10), matrixId);
    return { message: 'Pastor removido da landing page com sucesso' };
  }
}
