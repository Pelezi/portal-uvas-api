import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import { LandingPagePastorData } from '../dto/landing-page-pastor.dto';

@Injectable()
export class LandingPagePastorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudFrontService: CloudFrontService
  ) {}

  /**
   * Create a new landing page pastor entry
   */
  public async create(
    matrixId: number,
    data: LandingPagePastorData.CreateLandingPagePastorInput
  ): Promise<LandingPagePastorData.LandingPagePastorOutput> {
    // Check if member exists and is a pastor
    const member = await this.prisma.member.findFirst({
      where: {
        id: data.memberId,
        matrices: {
          some: {
            matrixId,
            isHidden: false
          }
        },
        isActive: true,
        ministryPositions: {
          some: {
            matrixId,
            ministry: {
              OR: [
                { type: 'PRESIDENT_PASTOR' },
                { type: 'PASTOR' }
              ]
            }
          }
        }
      }
    });

    if (!member) {
      throw new HttpException(
        'Membro não encontrado ou não é um pastor na matrix atual',
        HttpStatus.NOT_FOUND
      );
    }

    // Check if entry already exists
    const existingEntry = await this.prisma.landingPagePastor.findFirst({
      where: {
        matrixId,
        memberId: data.memberId
      }
    });

    if (existingEntry) {
      throw new HttpException(
        'Este pastor já está configurado na landing page',
        HttpStatus.CONFLICT
      );
    }

    // Create entry
    const landingPagePastor = await this.prisma.landingPagePastor.create({
      data: {
        matrixId,
        memberId: data.memberId,
        order: data.order,
        descriptions: data.descriptions
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        }
      }
    });

    return this.formatOutput(landingPagePastor);
  }

  /**
   * List all landing page pastors for a matrix
   */
  public async list(matrixId: number): Promise<LandingPagePastorData.LandingPagePastorOutput[]> {
    const pastors = await this.prisma.landingPagePastor.findMany({
      where: { matrixId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { member: { name: 'asc' } }
      ]
    });

    return pastors.map(pastor => this.formatOutput(pastor));
  }

  /**
   * Get eligible pastors (members with PASTOR or PRESIDENT_PASTOR ministry type)
   */
  public async getEligiblePastors(matrixId: number) {
    const pastors = await this.prisma.member.findMany({
      where: {
        matrices: {
          some: {
            matrixId,
            isHidden: false
          }
        },
        isActive: true,
        ministryPositions: {
          some: {
            matrixId,
            ministry: {
              OR: [
                { type: 'PRESIDENT_PASTOR' },
                { type: 'PASTOR' }
              ]
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        ministryPositions: {
          where: { matrixId },
          select: {
            ministry: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform photo URLs
    this.cloudFrontService.transformPhotoUrls(pastors);

    return pastors.map(pastor => ({
      id: pastor.id,
      name: pastor.name,
      photoUrl: pastor.photoUrl,
      ministryType: pastor.ministryPositions?.[0]?.ministry?.type || null,
      ministryName: pastor.ministryPositions?.[0]?.ministry?.name || null
    }));
  }

  /**
   * Update a landing page pastor entry
   */
  public async update(
    id: number,
    matrixId: number,
    data: LandingPagePastorData.UpdateLandingPagePastorInput
  ): Promise<LandingPagePastorData.LandingPagePastorOutput> {
    // Check if entry exists
    const existingEntry = await this.prisma.landingPagePastor.findFirst({
      where: { id, matrixId }
    });

    if (!existingEntry) {
      throw new HttpException('Entrada não encontrada', HttpStatus.NOT_FOUND);
    }

    // Update entry
    const landingPagePastor = await this.prisma.landingPagePastor.update({
      where: { id },
      data: {
        ...(data.order !== undefined && { order: data.order }),
        ...(data.descriptions && { descriptions: data.descriptions })
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        }
      }
    });

    return this.formatOutput(landingPagePastor);
  }

  /**
   * Delete a landing page pastor entry
   */
  public async delete(id: number, matrixId: number): Promise<void> {
    // Check if entry exists
    const existingEntry = await this.prisma.landingPagePastor.findFirst({
      where: { id, matrixId }
    });

    if (!existingEntry) {
      throw new HttpException('Entrada não encontrada', HttpStatus.NOT_FOUND);
    }

    await this.prisma.landingPagePastor.delete({
      where: { id }
    });
  }

  /**
   * Format output and transform photo URLs
   */
  private formatOutput(pastor: any): LandingPagePastorData.LandingPagePastorOutput {
    this.cloudFrontService.transformPhotoUrl(pastor.member);

    return {
      id: pastor.id,
      matrixId: pastor.matrixId,
      memberId: pastor.memberId,
      order: pastor.order,
      descriptions: pastor.descriptions,
      member: pastor.member,
      createdAt: pastor.createdAt,
      updatedAt: pastor.updatedAt
    };
  }
}
