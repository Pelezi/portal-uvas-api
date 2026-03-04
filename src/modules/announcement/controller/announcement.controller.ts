import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AnnouncementService } from '../service/announcement.service';
import { RestrictedGuard } from '../../common/security/restricted.guard';
import { PermissionGuard } from '../../common/security/permission.guard';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { FileUploadInterceptor } from '../../common/flow/file-upload.interceptor';
import { AnnouncementData } from '../dto/announcement.dto';
import { Public } from '../../common/decorators/public.decorator';
import { MatrixService } from '../../matrix/service/matrix.service';

@Controller('announcements')
@ApiTags('avisos')
@UseGuards(RestrictedGuard, PermissionGuard)
@ApiBearerAuth()
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly matrixService: MatrixService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo aviso' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título do aviso'
        },
        link: {
          type: 'string',
          description: 'Link externo (opcional)'
        },
        eventDate: {
          type: 'string',
          format: 'date',
          description: 'Data do evento (opcional)'
        },
        eventEndDate: {
          type: 'string',
          format: 'date',
          description: 'Data final do evento (opcional)'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Data de início de exibição'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Data de término de exibição'
        },
        desktopImage: {
          type: 'string',
          format: 'binary',
          description: 'Imagem para desktop (opcional)'
        },
        mobileImage: {
          type: 'string',
          format: 'binary',
          description: 'Imagem para mobile (opcional)'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Aviso criado com sucesso' })
  @UseInterceptors(FileUploadInterceptor)
  public async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: AnnouncementData.CreateAnnouncementInput
  ) {
    const desktopImage = req.uploadedFiles?.find((f: any) => f.fieldname === 'desktopImage');
    const mobileImage = req.uploadedFiles?.find((f: any) => f.fieldname === 'mobileImage');

    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.announcementService.create(
      matrixId,
      body,
      req.member!.id,
      desktopImage,
      mobileImage
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um aviso' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título do aviso'
        },
        link: {
          type: 'string',
          description: 'Link externo'
        },
        eventDate: {
          type: 'string',
          format: 'date',
          description: 'Data do evento'
        },
        eventEndDate: {
          type: 'string',
          format: 'date',
          description: 'Data final do evento'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Data de início de exibição'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Data de término de exibição'
        },
        desktopImage: {
          type: 'string',
          format: 'binary',
          description: 'Nova imagem para desktop (opcional)'
        },
        mobileImage: {
          type: 'string',
          format: 'binary',
          description: 'Nova imagem para mobile (opcional)'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Aviso atualizado com sucesso' })
  @UseInterceptors(FileUploadInterceptor)
  public async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: AnnouncementData.UpdateAnnouncementInput
  ) {
    const desktopImage = req.uploadedFiles?.find((f: any) => f.fieldname === 'desktopImage');
    const mobileImage = req.uploadedFiles?.find((f: any) => f.fieldname === 'mobileImage');

    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.announcementService.update(
      parseInt(id),
      matrixId,
      body,
      desktopImage,
      mobileImage
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar avisos' })
  @ApiResponse({ status: 200, description: 'Lista de avisos' })
  public async list(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    const filters: AnnouncementData.AnnouncementListFilterInput = {
      limit,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    return this.announcementService.list(matrixId, filters);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Obter avisos ativos (rota pública)' })
  @ApiResponse({ status: 200, description: 'Lista de avisos ativos' })
  public async getActive(
    @Req() req: AuthenticatedRequest,
    @Headers('origin') origin?: string,
    @Query('matrixId') matrixIdParam?: string
  ) {
    // Try to get matrixId from authenticated request first
    let matrixId = req.member?.matrixId;

    // If not authenticated, try to get from query parameter
    if (!matrixId && matrixIdParam) {
      matrixId = parseInt(matrixIdParam);
    }

    // If still no matrixId, try to get from origin header
    if (!matrixId && origin) {
      const matrix = await this.matrixService.findByDomain(origin);
      if (matrix) {
        matrixId = matrix.id;
      }
    }

    if (!matrixId) {
      throw new Error('Matrix ID não encontrado. Forneça o matrixId via query parameter ou origin header.');
    }

    return this.announcementService.getActive(matrixId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um aviso' })
  @ApiResponse({ status: 200, description: 'Detalhes do aviso' })
  public async findById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    return this.announcementService.findById(parseInt(id), matrixId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um aviso' })
  @ApiResponse({ status: 200, description: 'Aviso excluído' })
  public async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const matrixId = req.member?.matrixId;
    if (!matrixId) {
      throw new Error('Matrix ID não encontrado');
    }

    await this.announcementService.delete(parseInt(id), matrixId);
    return { message: 'Aviso excluído com sucesso' };
  }
}
