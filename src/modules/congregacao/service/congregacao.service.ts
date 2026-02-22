import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import * as CongregacaoData from '../model';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';
import { LoadedPermission } from '../../common/security/permission.service';
import { Prisma } from '../../../generated/prisma/client';

// Função auxiliar para limpar campos string que podem vir como number
function cleanStringField(value: string | number | undefined | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    // Converter número para string se necessário
    return typeof value === 'number' ? String(value) : value;
}

@Injectable()
export class CongregacaoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudFrontService: CloudFrontService
    ) {}

    public async findAll(matrixId: number, requestingMemberId: number, filters?: CongregacaoData.CongregacaoFilterInput, permission?: LoadedPermission | null) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const where: Prisma.CongregacaoWhereInput = { matrixId };
        
        const requestingMemberInfo = await this.prisma.member.findUnique({
            where: { id: requestingMemberId },
            include: {
                ministryPosition: true,
                ledCelulas: { include: { discipulado: { include: { rede: true } } } },
                discipulados: { include: { rede: true } },
                redes: true
            }
        });

        const isLeaderOrHigher = requestingMemberInfo?.ministryPosition?.type === 'LEADER' 
            || requestingMemberInfo?.ministryPosition?.type === 'DISCIPULADOR' 
            || requestingMemberInfo?.ministryPosition?.type === 'PASTOR';
        
        // Apply additional filters
        if (filters) {
            // Build OR conditions for permission-based filtering
            if (!filters.all && isLeaderOrHigher) {
                // Leaders, discipuladores, and pastors can see congregações from células they lead, discipulados they manage and redes they manage
                const congregacaoIdsFromCelulas = requestingMemberInfo.ledCelulas.map(c => c.discipulado.rede.congregacaoId);
                const congregacaoIdsFromDiscipulados = requestingMemberInfo.discipulados.map(d => d.rede.congregacaoId);
                const congregacaoIdsFromRedes = requestingMemberInfo.redes.map(r => r.congregacaoId);
                const congregacaoIdsFromUser = [...new Set([...congregacaoIdsFromCelulas, ...congregacaoIdsFromDiscipulados, ...congregacaoIdsFromRedes])];
                
                if (congregacaoIdsFromUser.length > 0) {
                    where.OR = [
                        { id: { in: congregacaoIdsFromUser } },
                    ];
                }
            }
            
            // Add congregacaoIds filter to OR conditions
            if (filters.congregacaoIds && filters.congregacaoIds.length > 0) {
                where.OR = [
                    ...(where.OR || []),
                    { id: { in: filters.congregacaoIds } },
                ];
            }
            
            // If not showing all and no permission conditions were added, return empty result
            if (!filters.all && (!where.OR || where.OR.length === 0)) {
                where.id = { equals: -1 }; // No congregações accessible
            }
            
            // Apply additional filters that narrow down the results (AND conditions with OR above)
            if (filters.name) {
                where.name = { contains: filters.name, mode: 'insensitive' };
            }
            if (filters.pastorGovernoMemberId) {
                where.pastorGovernoMemberId = Number(filters.pastorGovernoMemberId);
            }
            if (filters.vicePresidenteMemberId) {
                where.vicePresidenteMemberId = Number(filters.vicePresidenteMemberId);
            }
        }
        
        // Pastores de congregação (não-admin e não-principal) só podem ver sua própria congregação
        if (permission && !permission.isAdmin && permission.congregacaoIds && permission.congregacaoIds.length > 0) {
            // Check if user is pastor of principal congregation
            const principalCongregacao = await this.prisma.congregacao.findFirst({
                where: {
                    matrixId,
                    isPrincipal: true,
                    OR: [
                        { pastorGovernoMemberId: permission.id },
                        { vicePresidenteMemberId: permission.id }
                    ]
                }
            });

            // If not pastor of principal, filter to only their congregacoes
            if (!principalCongregacao) {
                where.id = { in: permission.congregacaoIds };
            }
        }
        
        const congregacoes = await this.prisma.congregacao.findMany({
            where,
            include: {
                pastorGoverno: true,
                vicePresidente: true,
                redes: {
                    include: {
                        pastor: true
                    }
                }
            },
            orderBy: [
                { isPrincipal: 'desc' },
                { name: 'asc' }
            ]
        });
        congregacoes.forEach(c => {
            this.cloudFrontService.transformPhotoUrl(c.pastorGoverno);
            this.cloudFrontService.transformPhotoUrl(c.vicePresidente);
            c.redes?.forEach(r => this.cloudFrontService.transformPhotoUrl(r.pastor));
        });
        return congregacoes;
    }

    public async findOne(id: number, matrixId: number, permission?: LoadedPermission | null) {
        const validator = createMatrixValidator(this.prisma);
        await validator.validateCongregacaoBelongsToMatrix(id, matrixId);

        // Check access permissions
        if (permission && !permission.isAdmin) {
            const congregacao = await this.prisma.congregacao.findUnique({ where: { id } });
            if (!congregacao) {
                throw new HttpException('Congregação não encontrada', HttpStatus.NOT_FOUND);
            }

            // Check if user is pastor of principal congregation
            const principalCongregacao = await this.prisma.congregacao.findFirst({
                where: {
                    matrixId,
                    isPrincipal: true,
                    OR: [
                        { pastorGovernoMemberId: permission.id },
                        { vicePresidenteMemberId: permission.id }
                    ]
                }
            });

            // If not pastor of principal and not pastor of this congregacao
            if (!principalCongregacao && !permission.congregacaoIds.includes(id)) {
                throw new HttpException('Você não tem permissão para visualizar esta congregação', HttpStatus.FORBIDDEN);
            }
        }

        const congregacao = await this.prisma.congregacao.findUnique({
            where: { id },
            include: {
                pastorGoverno: true,
                vicePresidente: true,
                redes: {
                    include: {
                        pastor: true,
                        discipulados: {
                            include: {
                                discipulador: true,
                                celulas: true
                            }
                        }
                    }
                }
            }
        });
        if (congregacao) {
            this.cloudFrontService.transformPhotoUrl(congregacao.pastorGoverno);
            this.cloudFrontService.transformPhotoUrl(congregacao.vicePresidente);
            congregacao.redes?.forEach(r => {
                this.cloudFrontService.transformPhotoUrl(r.pastor);
                r.discipulados?.forEach(d => this.cloudFrontService.transformPhotoUrl(d.discipulador));
            });
        }
        return congregacao;
    }

    public async create(data: CongregacaoData.CongregacaoCreateInput, permission: LoadedPermission) {
        const validator = createMatrixValidator(this.prisma);
        
        // Apenas admins podem criar congregações
        if (!permission.isAdmin) {
            throw new HttpException('Apenas administradores podem criar congregações', HttpStatus.FORBIDDEN);
        }

        // Validate pastor belongs to same matrix
        await validator.validateMemberBelongsToMatrix(data.pastorGovernoMemberId, data.matrixId!);

        if (data.vicePresidenteMemberId) {
            await validator.validateMemberBelongsToMatrix(data.vicePresidenteMemberId, data.matrixId!);
        }

        // If setting as principal, unset any existing principal for this matrix
        if (data.isPrincipal) {
            await this.prisma.congregacao.updateMany({
                where: { matrixId: data.matrixId!, isPrincipal: true },
                data: { isPrincipal: false }
            });
        }

        const congregacao = await this.prisma.congregacao.create({
            data: {
                name: data.name,
                matrixId: data.matrixId!,
                pastorGovernoMemberId: data.pastorGovernoMemberId,
                vicePresidenteMemberId: data.vicePresidenteMemberId,
                isPrincipal: data.isPrincipal ?? false,
                country: data.country,
                zipCode: cleanStringField(data.zipCode),
                street: data.street,
                streetNumber: cleanStringField(data.streetNumber),
                neighborhood: data.neighborhood,
                city: data.city,
                complement: data.complement,
                state: data.state
            },
            include: {
                pastorGoverno: true,
                vicePresidente: true
            }
        });
        this.cloudFrontService.transformPhotoUrl(congregacao.pastorGoverno);
        this.cloudFrontService.transformPhotoUrl(congregacao.vicePresidente);
        return congregacao;
    }

    public async update(id: number, data: CongregacaoData.CongregacaoUpdateInput, matrixId: number, permission: LoadedPermission) {
        const validator = createMatrixValidator(this.prisma);
        
        // Validate the congregacao being updated belongs to the matrix
        await validator.validateCongregacaoBelongsToMatrix(id, matrixId);
        
        const congregacao = await this.prisma.congregacao.findUnique({ where: { id } });
        if (!congregacao) {
            throw new BadRequestException('Congregação não encontrada');
        }

        // Check permissions
        if (!permission.isAdmin) {
            // Pastor of principal congregation can edit all congregacoes
            const principalCongregacao = await this.prisma.congregacao.findFirst({
                where: {
                    matrixId,
                    isPrincipal: true,
                    OR: [
                        { pastorGovernoMemberId: permission.id },
                        { vicePresidenteMemberId: permission.id }
                    ]
                }
            });

            // If not pastor of principal, can only edit their own congregacao
            if (!principalCongregacao && !permission.congregacaoIds.includes(id)) {
                throw new HttpException('Você não tem permissão para editar esta congregação', HttpStatus.FORBIDDEN);
            }
        }

        // Validate members belong to matrix
        if (data.pastorGovernoMemberId) {
            await validator.validateMemberBelongsToMatrix(data.pastorGovernoMemberId, matrixId);
        }

        if (data.vicePresidenteMemberId !== undefined && data.vicePresidenteMemberId !== null) {
            await validator.validateMemberBelongsToMatrix(data.vicePresidenteMemberId, matrixId);
        }

        // If setting as principal, unset any existing principal for this matrix
        if (data.isPrincipal && !congregacao.isPrincipal) {
            await this.prisma.congregacao.updateMany({
                where: { matrixId, isPrincipal: true },
                data: { isPrincipal: false }
            });
        }

        const congregacaoInfo = await this.prisma.congregacao.update({
            where: { id },
            data: {
                name: data.name,
                pastorGovernoMemberId: data.pastorGovernoMemberId,
                vicePresidenteMemberId: data.vicePresidenteMemberId,
                isPrincipal: data.isPrincipal,
                country: data.country,
                zipCode: cleanStringField(data.zipCode),
                street: data.street,
                streetNumber: cleanStringField(data.streetNumber),
                neighborhood: data.neighborhood,
                city: data.city,
                complement: data.complement,
                state: data.state
            },
            include: {
                pastorGoverno: true,
                vicePresidente: true
            }
        });
        this.cloudFrontService.transformPhotoUrl(congregacaoInfo.pastorGoverno);
        this.cloudFrontService.transformPhotoUrl(congregacaoInfo.vicePresidente);
        return congregacaoInfo;
    }

    public async delete(id: number, matrixId: number, permission: LoadedPermission) {
        const validator = createMatrixValidator(this.prisma);
        await validator.validateCongregacaoBelongsToMatrix(id, matrixId);

        // Apenas admins podem deletar congregações
        if (!permission.isAdmin) {
            throw new HttpException('Apenas administradores podem deletar congregações', HttpStatus.FORBIDDEN);
        }

        const congregacao = await this.prisma.congregacao.findUnique({
            where: { id },
            include: { redes: true }
        });

        if (!congregacao) {
            throw new BadRequestException('Congregação não encontrada');
        }

        if (congregacao.isPrincipal) {
            throw new BadRequestException('Não é possível deletar a congregação principal');
        }

        if (congregacao.redes.length > 0) {
            throw new BadRequestException('Congregação possui redes vinculadas');
        }

        return this.prisma.congregacao.delete({ where: { id } });
    }
}
