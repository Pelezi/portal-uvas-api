import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import { canBeDiscipulador, getMinistryTypeLabel } from '../../common/helpers/ministry-permissions.helper';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';
import { LoadedPermission } from '../../common/security/permission.service';
import * as DiscipuladoData from '../model';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class DiscipuladoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudFrontService: CloudFrontService
    ) { }

    public async findAll(matrixId: number, requestingMemberId: number, filters?: DiscipuladoData.DiscipuladoFilterInput) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const where: Prisma.DiscipuladoWhereInput = { matrixId };

        if (filters) {
            // Apply additional filters that narrow down the results (AND conditions with OR above)
            if (filters.congregacaoId) {
                where.rede = { congregacaoId: Number(filters.congregacaoId) };
            }
            if (filters.redeId) {
                where.redeId = Number(filters.redeId);
            }
            if (filters.discipuladorMemberId) {
                where.discipuladorMemberId = Number(filters.discipuladorMemberId);
            }
            if (filters.name) {
                where.discipulador = {
                    name: {
                        contains: filters.name,
                        mode: 'insensitive'
                    }
                };
            }
            if (filters.discipuladoIds && filters.discipuladoIds.length > 0) {
                where.id = { in: filters.discipuladoIds.map(Number) };
            } else if (!!!filters.all) {
                let discipuladoIds: number[] = [];
                // Se all for false e discipuladoIds não for fornecido, usar os discipulados do próprio usuário
                const member = await this.prisma.member.findUnique({
                    where: { id: requestingMemberId },
                    include: {
                        ledCelulas: { select: { discipuladoId: true } },
                        leadingInTrainingCelulas: { include: { celula: { select: { discipuladoId: true } } } },
                        discipulados: { select: { id: true } },
                        redes: { include: { discipulados: { select: { id: true } } } },
                        congregacoesVicePresidente: { include: { redes: { include: { discipulados: { select: { id: true } } } } } },
                        congregacoesPastorGoverno: { include: { redes: { include: { discipulados: { select: { id: true } } } } } },
                        congregacoesKidsLeader: { include: { redes: { include: { discipulados: { select: { id: true } } } } } },
                    }
                });
                if (!member) {
                    throw new HttpException('Membro não encontrado', HttpStatus.UNAUTHORIZED);
                }
                if (member.ledCelulas && member.ledCelulas.length > 0) {
                    // se o member é líder, adicionar os discipulados das células que lidera
                    member.ledCelulas.forEach(c => {
                        if (c.discipuladoId && !discipuladoIds.includes(c.discipuladoId)) {
                            discipuladoIds.push(c.discipuladoId);
                        }
                    });
                }
                if (member.leadingInTrainingCelulas && member.leadingInTrainingCelulas.length > 0) {
                    member.leadingInTrainingCelulas.forEach(c => {
                        if (c.celula.discipuladoId && !discipuladoIds.includes(c.celula.discipuladoId)) {
                            discipuladoIds.push(c.celula.discipuladoId);
                        }
                    });
                }
                if (member.discipulados && member.discipulados.length > 0) {
                    member.discipulados.forEach(d => {
                        if (d.id && !discipuladoIds.includes(d.id)) {
                            discipuladoIds.push(d.id);
                        }
                    });
                }
                if (member.redes && member.redes.length > 0) {
                    member.redes.forEach(r => {
                        r.discipulados.forEach(d => {
                            if (d.id && !discipuladoIds.includes(d.id)) {
                                discipuladoIds.push(d.id);
                            }
                        });
                    });
                }
                if (member.congregacoesVicePresidente && member.congregacoesVicePresidente.length > 0) {
                    member.congregacoesVicePresidente.forEach(c => {
                        c.redes.forEach(r => {
                            r.discipulados.forEach(d => {
                                if (d.id && !discipuladoIds.includes(d.id)) {
                                    discipuladoIds.push(d.id);
                                }
                            });
                        });
                    });
                }
                if (member.congregacoesPastorGoverno && member.congregacoesPastorGoverno.length > 0) {
                    member.congregacoesPastorGoverno.forEach(c => {
                        c.redes.forEach(r => {
                            r.discipulados.forEach(d => {
                                if (d.id && !discipuladoIds.includes(d.id)) {
                                    discipuladoIds.push(d.id);
                                }
                            });
                        });
                    });
                }
                if (member.congregacoesKidsLeader && member.congregacoesKidsLeader.length > 0) {
                    member.congregacoesKidsLeader.forEach(c => {
                        c.redes.forEach(r => {
                            if (r.isKids) {
                                r.discipulados.forEach(d => {
                                    if (d.id && !discipuladoIds.includes(d.id)) {
                                        discipuladoIds.push(d.id);
                                    }
                                });
                            }
                        });
                    });
                }
                if (discipuladoIds.length > 0) {
                    where.id = { in: discipuladoIds };
                } else {
                    where.id = { equals: -1 }; 
                }
            }
        }

        const discipulados = await this.prisma.discipulado.findMany({
            where,
            include: {
                rede: { include: { congregacao: true } },
                discipulador: true,
                disciples: {
                    include: {
                        member: true
                    }
                },
                celulas: { include: { leader: { omit: { password: true } } } }
            },
            orderBy: {
                discipulador: { name: 'asc' }
            }
        });
        discipulados.forEach(d => {
            this.cloudFrontService.transformPhotoUrl(d.discipulador);
            d.disciples?.forEach(disc => this.cloudFrontService.transformPhotoUrl(disc.member));
            d.celulas?.forEach(c => {
                if (c.leader) {
                    this.cloudFrontService.transformPhotoUrl(c.leader);
                }
            });
        });
        return discipulados;
    }

    public async getById(id: number, matrixId: number) {
        const discipulado = await this.prisma.discipulado.findFirst({
            where: { id, matrixId },
            include: {
                rede: { include: { congregacao: true } },
                discipulador: { omit: { password: true } },
                disciples: {
                    include: {
                        member: { omit: { password: true } }
                    }
                },
                celulas: { include: { leader: { omit: { password: true } } } }
            }
        });
        if (!discipulado) {
            throw new HttpException('Discipulado não encontrado', HttpStatus.NOT_FOUND);
        }
        this.cloudFrontService.transformPhotoUrl(discipulado.discipulador);
        discipulado.disciples?.forEach(disc => this.cloudFrontService.transformPhotoUrl(disc.member));
        discipulado.celulas?.forEach(c => {
            if (c.leader) {
                this.cloudFrontService.transformPhotoUrl(c.leader);
            }
        });
        return discipulado;
    }

    public async create(data: DiscipuladoData.DiscipuladoCreateInput, permission: LoadedPermission) {
        const validator = createMatrixValidator(this.prisma);

        // Validate rede belongs to same matrix
        await validator.validateRedeBelongsToMatrix(data.redeId, data.matrixId!);

        // Apenas admins ou pastores da rede podem criar discipulados
        if (!permission.isAdmin && !permission.redeIds.includes(data.redeId)) {
            throw new HttpException('Você não tem permissão para criar discipulados nesta rede', HttpStatus.FORBIDDEN);
        }

        if (data.discipuladorMemberId) {
            // Validate discipulador belongs to same matrix
            await validator.validateMemberBelongsToMatrix(data.discipuladorMemberId, data.matrixId!);

            const discipulador = await this.prisma.member.findUnique({
                where: { id: data.discipuladorMemberId },
                include: { ministryPosition: true }
            });
            if (!discipulador) {
                throw new BadRequestException('Discipulador não encontrado');
            }
            if (!canBeDiscipulador(discipulador.ministryPosition?.type)) {
                throw new BadRequestException(
                    `Membro não pode ser discipulador. Nível ministerial atual: ${getMinistryTypeLabel(discipulador.ministryPosition?.type)}. ` +
                    `É necessário ser pelo menos Discipulador.`
                );
            }
        }

        // Validate disciples if provided
        if (data.discipleIds && data.discipleIds.length > 0) {
            for (const discipleId of data.discipleIds) {
                await validator.validateMemberBelongsToMatrix(discipleId, data.matrixId!);
            }
        }

        const created = await this.prisma.discipulado.create({
            data: {
                redeId: data.redeId,
                discipuladorMemberId: data.discipuladorMemberId,
                matrixId: data.matrixId!,
                disciples: data.discipleIds ? {
                    create: data.discipleIds.map(memberId => ({ memberId }))
                } : undefined
            },
            include: {
                disciples: {
                    include: {
                        member: { omit: { password: true } }
                    }
                }
            }
        });

        return created;
    }

    public async update(id: number, data: Partial<DiscipuladoData.DiscipuladoCreateInput>, matrixId: number, permission: LoadedPermission) {
        const validator = createMatrixValidator(this.prisma);

        // Validate the discipulado being updated belongs to the matrix
        await validator.validateDiscipuladoBelongsToMatrix(id, matrixId);

        // Buscar o discipulado para verificar permissões
        const discipulado = await this.prisma.discipulado.findUnique({
            where: { id },
            select: { redeId: true }
        });

        if (!discipulado) {
            throw new BadRequestException('Discipulado não encontrado');
        }

        // Apenas admins, pastores da rede ou o próprio discipulador podem editar
        if (!permission.isAdmin && !permission.redeIds.includes(discipulado.redeId) && !permission.discipuladoIds.includes(id)) {
            throw new HttpException('Você não tem permissão para editar este discipulado', HttpStatus.FORBIDDEN);
        }

        // Validate rede belongs to same matrix if being updated
        if (data.redeId !== undefined) {
            await validator.validateRedeBelongsToMatrix(data.redeId, matrixId);

            // Se estiver mudando de rede, apenas admins ou pastores da nova rede podem fazer isso
            if (data.redeId !== discipulado.redeId) {
                if (!permission.isAdmin && !permission.redeIds.includes(data.redeId)) {
                    throw new HttpException('Você não tem permissão para mover este discipulado para outra rede', HttpStatus.FORBIDDEN);
                }
            }
        }

        if (data.discipuladorMemberId !== undefined && data.discipuladorMemberId !== null) {
            // Validate discipulador belongs to same matrix
            await validator.validateMemberBelongsToMatrix(data.discipuladorMemberId, matrixId);

            const discipulador = await this.prisma.member.findUnique({
                where: { id: data.discipuladorMemberId },
                include: { ministryPosition: true }
            });
            if (!discipulador) {
                throw new BadRequestException('Discipulador não encontrado');
            }
            if (!canBeDiscipulador(discipulador.ministryPosition.type)) {
                throw new BadRequestException(
                    `Membro não pode ser discipulador. Nível ministerial atual: ${getMinistryTypeLabel(discipulador.ministryPosition?.type)}. ` +
                    `É necessário ser pelo menos Discipulador.`
                );
            }
        }

        // Validate disciples if provided
        if (data.discipleIds && data.discipleIds.length > 0) {
            for (const discipleId of data.discipleIds) {
                await validator.validateMemberBelongsToMatrix(discipleId, matrixId);
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (data.redeId !== undefined) updateData.redeId = data.redeId;
        if (data.discipuladorMemberId !== undefined) updateData.discipuladorMemberId = data.discipuladorMemberId;

        // Handle disciples update
        if (data.discipleIds !== undefined) {
            // Delete existing disciples and create new ones
            updateData.disciples = {
                deleteMany: {},
                create: data.discipleIds.map(memberId => ({ memberId }))
            };
        }

        return this.prisma.discipulado.update({
            where: { id },
            data: updateData,
            include: {
                disciples: {
                    include: {
                        member: true
                    }
                }
            }
        });
    }

    public async delete(id: number, permission: LoadedPermission) {
        // Buscar o discipulado para verificar a rede
        const discipulado = await this.prisma.discipulado.findUnique({
            where: { id },
            select: { redeId: true }
        });

        if (!discipulado) {
            throw new BadRequestException('Discipulado não encontrado');
        }

        // Apenas admins ou pastores da rede podem deletar discipulados
        if (!permission.isAdmin && !permission.redeIds.includes(discipulado.redeId)) {
            throw new HttpException('Você não tem permissão para deletar este discipulado', HttpStatus.UNAUTHORIZED);
        }

        const count = await this.prisma.celula.count({ where: { discipuladoId: id } });
        if (count > 0) {
            throw new BadRequestException('Discipulado possui células vinculadas');
        }

        return this.prisma.discipulado.delete({ where: { id } });
    }

}
