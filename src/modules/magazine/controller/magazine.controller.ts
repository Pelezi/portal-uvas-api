import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MagazineService } from '../service/magazine.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { FileUploadInterceptor } from '../../common/flow/file-upload.interceptor';

@Controller('magazines')
@ApiTags('revistas')
@UseGuards(RestrictedGuard, PermissionGuard)
@ApiBearerAuth()
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

  @Post()
  @ApiOperation({ summary: 'Fazer upload de uma revista' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        weekStartDate: {
          type: 'string',
          format: 'date',
          description: 'Data de início da semana (domingo)'
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF ou Word da revista'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Revista enviada com sucesso' })
  @UseInterceptors(FileUploadInterceptor)
  public async upload(
    @Req() req: AuthenticatedRequest,
    @Body() body: { weekStartDate: string }
  ) {
    const file = req.uploadedFile;
    
    if (!file) {
      throw new Error('Arquivo é obrigatório');
    }

    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.magazineService.upload(
      matrixId,
      body.weekStartDate,
      req.member!.id,
      file
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar revistas' })
  @ApiResponse({ status: 200, description: 'Lista de revistas' })
  public async list(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Query('year') year?: number
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.magazineService.list(matrixId, { limit, year });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma revista' })
  @ApiResponse({ status: 200, description: 'Detalhes da revista' })
  public async findById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.magazineService.findById(parseInt(id), matrixId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Obter URL de download de uma revista' })
  @ApiResponse({ status: 200, description: 'URL de download' })
  public async getDownloadUrl(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    const url = await this.magazineService.getDownloadUrl(parseInt(id), matrixId);
    return { url };
  }

  @Get('current-week/magazine')
  @ApiOperation({ summary: 'Obter revista da semana atual' })
  @ApiResponse({ status: 200, description: 'Revista da semana atual' })
  public async getCurrentWeekMagazine(
    @Req() req: AuthenticatedRequest
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.magazineService.getCurrentWeekMagazine(matrixId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma revista' })
  @ApiResponse({ status: 200, description: 'Revista excluída' })
  public async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    await this.magazineService.delete(parseInt(id), matrixId);
    return { message: 'Revista excluída com sucesso' };
  }
}
