import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import { AwsService } from '../../common/provider/aws.provider';
import { MatrixService } from '../../matrix/service/matrix.service';
import { AnnouncementData } from '../dto/announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
    private readonly matrixService: MatrixService,
    private readonly cloudFrontService: CloudFrontService
  ) {}

  /**
   * Create a new announcement
   */
  public async create(
    matrixId: number,
    data: AnnouncementData.CreateAnnouncementInput,
    createdById: number,
    desktopImage?: any,
    mobileImage?: any
  ): Promise<AnnouncementData.AnnouncementOutput> {
    // Validate at least one image is provided
    if (!desktopImage && !mobileImage) {
      throw new HttpException('Pelo menos uma imagem (desktop ou mobile) é obrigatória', HttpStatus.BAD_REQUEST);
    }

    // Validate image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (desktopImage && !allowedTypes.includes(desktopImage.mimetype)) {
      throw new HttpException('Tipo de imagem desktop não suportado. Use JPEG, PNG ou WebP.', HttpStatus.BAD_REQUEST);
    }

    if (mobileImage && !allowedTypes.includes(mobileImage.mimetype)) {
      throw new HttpException('Tipo de imagem mobile não suportado. Use JPEG, PNG ou WebP.', HttpStatus.BAD_REQUEST);
    }

    // Get matrix info
    const matrix = await this.matrixService.findById(matrixId);

    let desktopImageUrl: string | null = null;
    let mobileImageUrl: string | null = null;

    // Upload desktop image if provided
    if (desktopImage) {
      const timestamp = Date.now();
      const extension = desktopImage.mimetype.split('/')[1];
      const desktopFileName = `${matrix.name}/avisos/desktop/${timestamp}_desktop.${extension}`;
      await this.awsService.uploadFile(desktopImage.buffer, desktopFileName, desktopImage.mimetype);
      desktopImageUrl = desktopFileName;
    }

    // Upload mobile image if provided
    if (mobileImage) {
      const timestamp = Date.now();
      const extension = mobileImage.mimetype.split('/')[1];
      const mobileFileName = `${matrix.name}/avisos/mobile/${timestamp}_mobile.${extension}`;
      await this.awsService.uploadFile(mobileImage.buffer, mobileFileName, mobileImage.mimetype);
      mobileImageUrl = mobileFileName;
    }

    // Create announcement record
    const announcement = await this.prisma.announcement.create({
      data: {
        matrixId,
        title: data.title,
        link: data.link || null,
        desktopImageUrl,
        mobileImageUrl,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdById
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return this.formatAnnouncementOutput(announcement);
  }

  /**
   * Update an announcement
   */
  public async update(
    id: number,
    matrixId: number,
    data: AnnouncementData.UpdateAnnouncementInput,
    desktopImage?: any,
    mobileImage?: any
  ): Promise<AnnouncementData.AnnouncementOutput> {
    // Check if announcement exists
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, matrixId }
    });

    if (!announcement) {
      throw new HttpException('Aviso não encontrado', HttpStatus.NOT_FOUND);
    }

    // Validate image types if provided
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (desktopImage && !allowedTypes.includes(desktopImage.mimetype)) {
      throw new HttpException('Tipo de imagem desktop não suportado. Use JPEG, PNG ou WebP.', HttpStatus.BAD_REQUEST);
    }

    if (mobileImage && !allowedTypes.includes(mobileImage.mimetype)) {
      throw new HttpException('Tipo de imagem mobile não suportado. Use JPEG, PNG ou WebP.', HttpStatus.BAD_REQUEST);
    }

    // Get matrix info
    const matrix = await this.matrixService.findById(matrixId);

    const updateData: any = {};

    // Update text fields if provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate ? new Date(data.eventDate) : null;
    if (data.eventEndDate !== undefined) updateData.eventEndDate = data.eventEndDate ? new Date(data.eventEndDate) : null;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

    // Upload new desktop image if provided
    if (desktopImage) {
      // Delete old desktop image if exists
      if (announcement.desktopImageUrl) {
        try {
          await this.awsService.deleteFile(announcement.desktopImageUrl);
        } catch (error) {
          console.error('Error deleting old desktop image:', error);
        }
      }

      const timestamp = Date.now();
      const extension = desktopImage.mimetype.split('/')[1];
      const desktopFileName = `${matrix.name}/avisos/desktop/${timestamp}_desktop.${extension}`;
      await this.awsService.uploadFile(desktopImage.buffer, desktopFileName, desktopImage.mimetype);
      updateData.desktopImageUrl = desktopFileName;
    }

    // Upload new mobile image if provided
    if (mobileImage) {
      // Delete old mobile image if exists
      if (announcement.mobileImageUrl) {
        try {
          await this.awsService.deleteFile(announcement.mobileImageUrl);
        } catch (error) {
          console.error('Error deleting old mobile image:', error);
        }
      }

      const timestamp = Date.now();
      const extension = mobileImage.mimetype.split('/')[1];
      const mobileFileName = `${matrix.name}/avisos/mobile/${timestamp}_mobile.${extension}`;
      await this.awsService.uploadFile(mobileImage.buffer, mobileFileName, mobileImage.mimetype);
      updateData.mobileImageUrl = mobileFileName;
    }

    // Update announcement
    const updatedAnnouncement = await this.prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return this.formatAnnouncementOutput(updatedAnnouncement);
  }

  /**
   * List announcements for a matrix
   */
  public async list(
    matrixId: number,
    filters?: AnnouncementData.AnnouncementListFilterInput
  ): Promise<AnnouncementData.AnnouncementOutput[]> {
    const where: any = { matrixId };

    if (filters?.isActive !== undefined) {
      const now = new Date();
      if (filters.isActive) {
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      }
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Number(filters?.limit) || 50
    });

    return announcements.map(announcement => this.formatAnnouncementOutput(announcement));
  }

  /**
   * Get active announcements
   */
  public async getActive(matrixId: number): Promise<AnnouncementData.AnnouncementOutput[]> {
    const now = new Date();

    const announcements = await this.prisma.announcement.findMany({
      where: {
        matrixId,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return announcements.map(announcement => this.formatAnnouncementOutput(announcement));
  }

  /**
   * Find announcement by ID
   */
  public async findById(
    id: number,
    matrixId: number
  ): Promise<AnnouncementData.AnnouncementOutput> {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, matrixId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!announcement) {
      throw new HttpException('Aviso não encontrado', HttpStatus.NOT_FOUND);
    }

    return this.formatAnnouncementOutput(announcement);
  }

  /**
   * Delete an announcement
   */
  public async delete(id: number, matrixId: number): Promise<void> {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, matrixId }
    });

    if (!announcement) {
      throw new HttpException('Aviso não encontrado', HttpStatus.NOT_FOUND);
    }

    // Delete images from S3
    const deletePromises: Promise<any>[] = [];

    if (announcement.desktopImageUrl) {
      deletePromises.push(
        this.awsService.deleteFile(announcement.desktopImageUrl).catch(error => {
          console.error('Error deleting desktop image:', error);
        })
      );
    }

    if (announcement.mobileImageUrl) {
      deletePromises.push(
        this.awsService.deleteFile(announcement.mobileImageUrl).catch(error => {
          console.error('Error deleting mobile image:', error);
        })
      );
    }

    await Promise.all(deletePromises);

    // Delete announcement record
    await this.prisma.announcement.delete({
      where: { id }
    });
  }

  /**
   * Format announcement output with CloudFront URLs
   */
  private formatAnnouncementOutput(announcement: any): AnnouncementData.AnnouncementOutput {
    return {
      id: announcement.id,
      title: announcement.title,
      link: announcement.link,
      desktopImageUrl: announcement.desktopImageUrl 
        ? this.cloudFrontService.getPhotoUrl(announcement.desktopImageUrl) || announcement.desktopImageUrl
        : null,
      mobileImageUrl: announcement.mobileImageUrl
        ? this.cloudFrontService.getPhotoUrl(announcement.mobileImageUrl) || announcement.mobileImageUrl
        : null,
      eventDate: announcement.eventDate,
      eventEndDate: announcement.eventEndDate,
      startDate: announcement.startDate,
      endDate: announcement.endDate,
      createdBy: announcement.createdBy,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt
    };
  }
}
