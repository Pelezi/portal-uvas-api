import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, CloudFrontService, PdfThumbnailService } from '../../common';
import { AwsService } from '../../common/provider/aws.provider';
import { MatrixService } from '../../matrix/service/matrix.service';
import { MagazineData } from '../dto/magazine.dto';

@Injectable()
export class MagazineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
    private readonly matrixService: MatrixService,
    private readonly cloudFrontService: CloudFrontService,
    private readonly pdfThumbnailService: PdfThumbnailService
  ) {}

  /**
   * Upload a magazine file
   */
  public async upload(
    matrixId: number,
    weekStartDate: string,
    uploadedById: number,
    file: any
  ): Promise<MagazineData.MagazineOutput> {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new HttpException('Tipo de arquivo não suportado. Use PDF ou Word.', HttpStatus.BAD_REQUEST);
    }

    // Get file extension
    const fileExtension = file.mimetype === 'application/pdf' ? 'pdf' : 
                         file.mimetype === 'application/msword' ? 'doc' : 'docx';

    // Get matrix info
    const matrix = await this.matrixService.findById(matrixId);

    // Calculate week end date (Saturday)
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Check if magazine already exists for this week
    const existingMagazine = await this.prisma.magazine.findFirst({
      where: {
        matrixId,
        weekStartDate: startDate
      }
    });

    if (existingMagazine) {
      throw new HttpException('Já existe uma revista cadastrada para esta semana.', HttpStatus.CONFLICT);
    }

    // Generate filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${matrix.name}/revistas/${timestamp}_${sanitizedFileName}`;

    // Upload file to AWS
    await this.awsService.uploadFile(file.buffer, fileName, file.mimetype);

    // Generate and upload thumbnail if PDF
    let thumbnailUrl: string | null = null;
    if (file.mimetype === 'application/pdf') {
      try {
        // Generate thumbnail from first page
        const thumbnailBuffer = await this.pdfThumbnailService.generateThumbnailJpeg(
          file.buffer,
          400, // width
          85 // quality (0-100)
        );

        // Upload thumbnail to S3
        const thumbnailFileName = `${matrix.name}/revistas/thumbnails/${timestamp}_${sanitizedFileName.replace(/\.pdf$/i, '.jpg')}`;
        await this.awsService.uploadFile(thumbnailBuffer, thumbnailFileName, 'image/jpeg');
        
        // Store thumbnail path (will be converted to CloudFront URL on retrieval)
        thumbnailUrl = thumbnailFileName;
      } catch (error) {
        console.error('Error generating thumbnail for PDF:', error);
        // Continue without thumbnail if generation fails
      }
    }

    // Create magazine record
    const magazine = await this.prisma.magazine.create({
      data: {
        matrixId,
        fileName: file.originalname,
        fileUrl: fileName,
        fileType: fileExtension,
        weekStartDate: startDate,
        weekEndDate: endDate,
        uploadedById,
        thumbnailUrl
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return this.formatMagazineOutput(magazine);
  }

  /**
   * List magazines for a matrix
   */
  public async list(
    matrixId: number,
    filters?: MagazineData.MagazineListFilterInput
  ): Promise<MagazineData.MagazineOutput[]> {
    const where: any = { matrixId };

    if (filters?.year) {
      const yearStart = new Date(`${filters.year}-01-01`);
      const yearEnd = new Date(`${filters.year}-12-31`);
      where.weekStartDate = {
        gte: yearStart,
        lte: yearEnd
      };
    }

    const magazines = await this.prisma.magazine.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        weekStartDate: 'desc'
      },
      take: Number(filters?.limit) || 50
    });

    return magazines.map((m: any) => this.formatMagazineOutput(m));
  }

  /**
   * Get a single magazine by ID
   */
  public async findById(id: number, matrixId: number): Promise<MagazineData.MagazineOutput> {
    const magazine = await this.prisma.magazine.findFirst({
      where: {
        id,
        matrixId
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!magazine) {
      throw new HttpException('Revista não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.formatMagazineOutput(magazine);
  }

  /**
   * Delete a magazine
   */
  public async delete(id: number, matrixId: number): Promise<void> {
    const magazine = await this.prisma.magazine.findFirst({
      where: {
        id,
        matrixId
      }
    });

    if (!magazine) {
      throw new HttpException('Revista não encontrada', HttpStatus.NOT_FOUND);
    }

    // Delete file from AWS
    try {
      await this.awsService.deleteFile(magazine.fileUrl);
    } catch (error) {
      console.error('Error deleting magazine file from AWS:', error);
      // Continue with deletion even if AWS deletion fails
    }

    // Delete thumbnail from AWS if exists
    if (magazine.thumbnailUrl) {
      try {
        await this.awsService.deleteFile(magazine.thumbnailUrl);
      } catch (error) {
        console.error('Error deleting magazine thumbnail from AWS:', error);
        // Continue with deletion even if thumbnail deletion fails
      }
    }

    // Delete magazine record
    await this.prisma.magazine.delete({
      where: { id }
    });
  }

  /**
   * Get download URL for a magazine
   */
  public async getDownloadUrl(id: number, matrixId: number): Promise<string> {
    const magazine = await this.prisma.magazine.findFirst({
      where: {
        id,
        matrixId
      }
    });

    if (!magazine) {
      throw new HttpException('Revista não encontrada', HttpStatus.NOT_FOUND);
    }

    // Return CloudFront URL
    return this.cloudFrontService.getPhotoUrl(magazine.fileUrl) || '';
  }

  /**
   * Get current week's magazine
   */
  public async getCurrentWeekMagazine(matrixId: number): Promise<MagazineData.MagazineOutput | null> {
    // Calculate current week's Sunday (start of week)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    // Calculate next Sunday (end of week range)
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);

    const magazine = await this.prisma.magazine.findFirst({
      where: {
        matrixId,
        weekStartDate: {
          gte: sunday,
          lt: nextSunday
        }
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!magazine) {
      return null;
    }

    return this.formatMagazineOutput(magazine);
  }

  /**
   * Format magazine output
   */
  private formatMagazineOutput(magazine: any): MagazineData.MagazineOutput {
    return {
      id: magazine.id,
      fileName: magazine.fileName,
      fileUrl: this.cloudFrontService.getPhotoUrl(magazine.fileUrl) || magazine.fileUrl,
      fileType: magazine.fileType,
      weekStartDate: magazine.weekStartDate,
      weekEndDate: magazine.weekEndDate,
      uploadedBy: magazine.uploadedBy,
      thumbnailUrl: magazine.thumbnailUrl 
        ? this.cloudFrontService.getPhotoUrl(magazine.thumbnailUrl) || magazine.thumbnailUrl
        : null,
      createdAt: magazine.createdAt,
      updatedAt: magazine.updatedAt
    };
  }
}
