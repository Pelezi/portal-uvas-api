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
    ) { }

    public async findAll(matrixId: number, requestingMemberId: number, filters?: CongregacaoData.CongregacaoFilterInput) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const where: Prisma.CongregacaoWhereInput = { matrixId };

        // Apply additional filters
        if (filters) {
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
            if (filters.congregacaoIds && filters.congregacaoIds.length > 0) {
                where.id = { in: filters.congregacaoIds.map(id => Number(id)) };
            } else if (!!!filters.all) {
                let congregacaoIds: number[] = [];

                const member = await this.prisma.member.findUnique({
                    where: { id: requestingMemberId },
                    select: {
                        ledCelulas: { select: { discipulado: { select: { rede: { select: { congregacaoId: true } } } } } },
                        leadingInTrainingCelulas: { select: { celula: { select: { discipulado: { select: { rede: { select: { congregacaoId: true } } } } } } } },
                        discipulados: { select: { rede: { select: { congregacaoId: true } } } },
                        redes: { select: { congregacaoId: true } },
                        congregacoesVicePresidente: { select: { id: true } },
                        congregacoesPastorGoverno: { select: { id: true } },
                        congregacoesKidsLeader: { select: { id: true } }
                    },
                });
                if (!member) {
                    throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
                }
                if (member.ledCelulas && member.ledCelulas.length > 0) {
                    member.ledCelulas.forEach(c => {
                        if (c.discipulado && c.discipulado.rede && c.discipulado.rede.congregacaoId) {
                            if (!congregacaoIds.includes(c.discipulado.rede.congregacaoId)) {
                                congregacaoIds.push(c.discipulado.rede.congregacaoId);
                            }
                        }
                    });
                }
                if (member.leadingInTrainingCelulas && member.leadingInTrainingCelulas.length > 0) {
                    member.leadingInTrainingCelulas.forEach(c => {
                        if (c.celula && c.celula.discipulado && c.celula.discipulado.rede && c.celula.discipulado.rede.congregacaoId) {
                            if (!congregacaoIds.includes(c.celula.discipulado.rede.congregacaoId)) {
                                congregacaoIds.push(c.celula.discipulado.rede.congregacaoId);
                            }
                        }
                    });
                }
                if (member.discipulados && member.discipulados.length > 0) {
                    member.discipulados.forEach(d => {
                        if (d.rede && d.rede.congregacaoId) {
                            if (!congregacaoIds.includes(d.rede.congregacaoId)) {
                                congregacaoIds.push(d.rede.congregacaoId);
                            }
                        }
                    });
                }
                if (member.redes && member.redes.length > 0) {
                    member.redes.forEach(r => {
                        if (r.congregacaoId) {
                            if (!congregacaoIds.includes(r.congregacaoId)) {
                                congregacaoIds.push(r.congregacaoId);
                            }
                        }
                    });
                }
                if (member.congregacoesVicePresidente && member.congregacoesVicePresidente.length > 0) {
                    member.congregacoesVicePresidente.forEach(c => {
                        if (!congregacaoIds.includes(c.id)) {
                            congregacaoIds.push(c.id);
                        }
                    });
                }
                if (member.congregacoesPastorGoverno && member.congregacoesPastorGoverno.length > 0) {
                    member.congregacoesPastorGoverno.forEach(c => {
                        if (!congregacaoIds.includes(c.id)) {
                            congregacaoIds.push(c.id);
                        }
                    });
                }
                if (member.congregacoesKidsLeader && member.congregacoesKidsLeader.length > 0) {
                    member.congregacoesKidsLeader.forEach(c => {
                        if (!congregacaoIds.includes(c.id)) {
                            congregacaoIds.push(c.id);
                        }
                    });
                }
                if (congregacaoIds.length > 0) {
                    where.id = { in: congregacaoIds };
                } else {
                    where.id = -1;
                }
            }
        }

        const congregacoes = await this.prisma.congregacao.findMany({
            where,
            include: {
                pastorGoverno: true,
                vicePresidente: true,
                kidsLeader: true,
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
            this.cloudFrontService.transformPhotoUrl(c.kidsLeader);
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
                kidsLeader: true,
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
            this.cloudFrontService.transformPhotoUrl(congregacao.kidsLeader);
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

        if (data.kidsLeaderMemberId) {
            await validator.validateMemberBelongsToMatrix(data.kidsLeaderMemberId, data.matrixId!);
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
                kidsLeaderMemberId: data.kidsLeaderMemberId,
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
                vicePresidente: true,
                kidsLeader: true
            }
        });
        this.cloudFrontService.transformPhotoUrl(congregacao.pastorGoverno);
        this.cloudFrontService.transformPhotoUrl(congregacao.vicePresidente);
        this.cloudFrontService.transformPhotoUrl(congregacao.kidsLeader);
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

        if (data.kidsLeaderMemberId !== undefined && data.kidsLeaderMemberId !== null) {
            await validator.validateMemberBelongsToMatrix(data.kidsLeaderMemberId, matrixId);
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
                kidsLeaderMemberId: data.kidsLeaderMemberId,
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
                vicePresidente: true,
                kidsLeader: true
            }
        });
        this.cloudFrontService.transformPhotoUrl(congregacaoInfo.pastorGoverno);
        this.cloudFrontService.transformPhotoUrl(congregacaoInfo.vicePresidente);
        this.cloudFrontService.transformPhotoUrl(congregacaoInfo.kidsLeader);
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
