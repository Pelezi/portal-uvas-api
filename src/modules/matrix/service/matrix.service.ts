import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import { MatrixCreateInput, MatrixUpdateInput } from '../model/matrix.input';

@Injectable()
export class MatrixService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudFrontService: CloudFrontService
    ) { }

    public async findAll() {
        return this.prisma.matrix.findMany({
            include: {
                domains: true,
                _count: {
                    select: { members: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    public async findById(id: number) {
        const matrix = await this.prisma.matrix.findUnique({
            where: { id },
            include: {
                domains: true,
                _count: {
                    select: { members: true }
                }
            }
        });

        if (!matrix) {
            throw new HttpException('Matrix not found', HttpStatus.NOT_FOUND);
        }

        return matrix;
    }

    /**
     * Normalizes a domain string by removing protocol, port, and www prefix
     * Examples:
     * - "https://videira-caruaru.com" -> "videira-caruaru.com"
     * - "http://localhost:3000" -> "localhost"
     * - "www.example.com:8080" -> "example.com"
     */
    private normalizeDomain(rawDomain: string): string {
        if (!rawDomain) return '';
        
        let normalized = rawDomain.toLowerCase().trim();
        
        // Remove protocol (http://, https://)
        normalized = normalized.replace(/^https?:\/\//, '');
        
        // Remove port
        normalized = normalized.replace(/:\d+$/, '');
        
        // Remove www. prefix
        normalized = normalized.replace(/^www\./, '');
        
        // Remove trailing slash
        normalized = normalized.replace(/\/$/, '');
        
        return normalized;
    }

    public async findByDomain(domain: string) {
        const normalizedDomain = this.normalizeDomain(domain);
        
        const matrixDomain = await this.prisma.matrixDomain.findUnique({
            where: { domain: normalizedDomain },
            include: {
                matrix: {
                    include: {
                        domains: true
                    }
                }
            }
        });

        return matrixDomain?.matrix || null;
    }

    public async create(data: MatrixCreateInput) {
        if (!data.domains || data.domains.length === 0) {
            throw new HttpException('At least one domain is required', HttpStatus.BAD_REQUEST);
        }

        // Normalize all domains before checking/saving
        const normalizedDomains = data.domains.map(d => this.normalizeDomain(d));

        // Verificar se algum domínio já existe
        const existingDomains = await this.prisma.matrixDomain.findMany({
            where: {
                domain: { in: normalizedDomains }
            }
        });

        if (existingDomains.length > 0) {
            throw new HttpException(
                `Domain(s) already exist: ${existingDomains.map(d => d.domain).join(', ')}`,
                HttpStatus.BAD_REQUEST
            );
        }

        return this.prisma.matrix.create({
            data: {
                name: data.name,
                domains: {
                    create: normalizedDomains.map(domain => ({ domain }))
                }
            },
            include: {
                domains: true
            }
        });
    }

    public async update(id: number, data: MatrixUpdateInput) {
        await this.findById(id); // Verificar se existe

        const updateData: any = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.whatsappApiKey !== undefined) {
            updateData.whatsappApiKey = data.whatsappApiKey;
        }

        if (data.pixKey !== undefined) {
            updateData.pixKey = data.pixKey;
        }

        if (data.pixCode !== undefined) {
            updateData.pixCode = data.pixCode;
        }

        if (data.whatsappNumber !== undefined) {
            updateData.whatsappNumber = data.whatsappNumber;
        }

        if (data.instagramUrl !== undefined) {
            updateData.instagramUrl = data.instagramUrl;
        }

        if (data.facebookUrl !== undefined) {
            updateData.facebookUrl = data.facebookUrl;
        }

        if (data.youtubeUrl !== undefined) {
            updateData.youtubeUrl = data.youtubeUrl;
        }

        if (data.domains !== undefined) {
            // Normalize all domains before checking/saving
            const normalizedDomains = data.domains.map(d => this.normalizeDomain(d));

            // Verificar se algum dos novos domínios já existe em outra matrix
            const existingDomains = await this.prisma.matrixDomain.findMany({
                where: {
                    domain: { in: normalizedDomains },
                    matrixId: { not: id }
                }
            });

            if (existingDomains.length > 0) {
                throw new HttpException(
                    `Domain(s) already exist in another matrix: ${existingDomains.map(d => d.domain).join(', ')}`,
                    HttpStatus.BAD_REQUEST
                );
            }

            // Deletar domínios antigos e criar novos
            await this.prisma.matrixDomain.deleteMany({
                where: { matrixId: id }
            });

            updateData.domains = {
                create: normalizedDomains.map(domain => ({ domain }))
            };
        }

        return this.prisma.matrix.update({
            where: { id },
            data: updateData,
            include: {
                domains: true
            }
        });
    }

    public async delete(id: number) {
        await this.findById(id); // Verificar se existe

        // Verificar se há membros associados
        const memberCount = await this.prisma.memberMatrix.count({
            where: { matrixId: id }
        });

        if (memberCount > 0) {
            throw new HttpException(
                'Cannot delete matrix with associated members',
                HttpStatus.BAD_REQUEST
            );
        }

        await this.prisma.matrix.delete({
            where: { id }
        });
    }

    public async addMemberToMatrix(memberId: number, matrixId: number) {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });
        if (!member) {
            throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
        }

        await this.findById(matrixId);

        const existing = await this.prisma.memberMatrix.findFirst({
            where: {
                memberId,
                matrixId
            }
        });

        if (existing) {
            throw new HttpException('Member already in this matrix', HttpStatus.BAD_REQUEST);
        }

        return this.prisma.memberMatrix.create({
            data: {
                memberId,
                matrixId
            },
            include: {
                member: true,
                matrix: {
                    include: {
                        domains: true
                    }
                }
            }
        });
    }

    public async removeMemberFromMatrix(memberId: number, matrixId: number) {
        const memberMatrix = await this.prisma.memberMatrix.findFirst({
            where: {
                memberId,
                matrixId
            }
        });

        if (!memberMatrix) {
            throw new HttpException('Member not in this matrix', HttpStatus.NOT_FOUND);
        }

        await this.prisma.memberMatrix.delete({
            where: { id: memberMatrix.id }
        });
    }

    public async getMemberMatrices(memberId: number) {
        const memberMatrices = await this.prisma.memberMatrix.findMany({
            where: { memberId },
            include: {
                matrix: {
                    include: {
                        domains: true
                    }
                }
            }
        });

        return memberMatrices.map(mm => mm.matrix);
    }

    /**
     * Get landing page data for a domain (matrix info, congregations, pastoral team)
     */
    public async getLandingPageData(domain: string) {
        const normalizedDomain = this.normalizeDomain(domain);
        
        const matrixDomain = await this.prisma.matrixDomain.findUnique({
            where: { domain: normalizedDomain },
            include: {
                matrix: {
                    include: {
                        domains: true,
                        congregacoes: {
                            include: {
                                pastorGoverno: {
                                    select: {
                                        id: true,
                                        name: true,
                                        photoUrl: true
                                    }
                                },
                                vicePresidente: {
                                    select: {
                                        id: true,
                                        name: true,
                                        photoUrl: true
                                    }
                                },
                                kidsLeader: {
                                    select: {
                                        id: true,
                                        name: true,
                                        photoUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!matrixDomain || !matrixDomain.matrix) {
            return null;
        }

        const matrix = matrixDomain.matrix;

        // Get all members who are pastors with their responsibilities
        // Include: PRESIDENT_PASTOR, pastors of congregations, and pastors of redes
        const pastoralTeam = await this.prisma.member.findMany({
            where: {
                matrices: {
                    some: {
                        matrixId: matrix.id,
                        isHidden: false
                    }
                },
                isActive: true,
                gender: 'MALE',
                OR: [
                    {
                        ministryPosition: {
                            type: 'PRESIDENT_PASTOR'
                        }
                    },
                    {
                        congregacoesPastorGoverno: {
                            some: {
                                matrixId: matrix.id
                            }
                        }
                    },
                    {
                        redes: {
                            some: {
                                matrixId: matrix.id
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                photoUrl: true,
                ministryPosition: {
                    select: {
                        name: true,
                        type: true
                    }
                },
                congregacoesPastorGoverno: {
                    where: {
                        matrixId: matrix.id
                    },
                    select: {
                        id: true,
                        name: true
                    }
                },
                redes: {
                    where: {
                        matrixId: matrix.id
                    },
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { ministryPosition: { type: 'asc' } }, // PRESIDENT_PASTOR comes first
                { name: 'asc' }
            ]
        });

        // Transform photo URLs using CloudFront
        this.cloudFrontService.transformPhotoUrls(pastoralTeam);
        matrix.congregacoes.forEach(cong => {
            this.cloudFrontService.transformPhotoUrl(cong.pastorGoverno);
            this.cloudFrontService.transformPhotoUrl(cong.vicePresidente);
            this.cloudFrontService.transformPhotoUrl(cong.kidsLeader);
        });

        return {
            id: matrix.id,
            name: matrix.name,
            pixKey: matrix.pixKey,
            pixCode: matrix.pixCode,
            whatsappNumber: matrix.whatsappNumber,
            instagramUrl: matrix.instagramUrl,
            facebookUrl: matrix.facebookUrl,
            youtubeUrl: matrix.youtubeUrl,
            congregacoes: matrix.congregacoes,
            pastoralTeam
        };
    }
}
