import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import { canBePastor, getMinistryTypeLabel } from '../../common/helpers/ministry-permissions.helper';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';
import { LoadedPermission } from '../../common/security/permission.service';
import { RedeWhereInput } from '../../../generated/prisma/models';
import * as RedeData from '../model';

@Injectable()
export class RedeService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudFrontService: CloudFrontService
    ) { }

    public async findAll(matrixId: number, requestingMemberId: number, filters?: RedeData.RedeFilterInput) {
        try {
            // MANDATORY: Filter by matrixId to prevent cross-matrix access
            const where: RedeWhereInput = { matrixId };

            if (filters) {
                if (filters.congregacaoId) {
                    where.congregacaoId = Number(filters.congregacaoId);
                }
                if (filters.pastorMemberId) {
                    where.pastorMemberId = Number(filters.pastorMemberId);
                }
                if (filters.redeIds && filters.redeIds.length > 0) {
                    where.id = { in: filters.redeIds.map(Number) };
                } else if (!!!filters.all) {
                    let redesIds: number[] = [];

                    // Se redeIds não for fornecido, usar os redes do próprio usuário
                    const member = await this.prisma.member.findUnique({
                        where: { id: requestingMemberId },
                        include: {
                            ledCelulas: { select: { discipulado: { select: { redeId: true } } } },
                            leadingInTrainingCelulas: { select: { celula: { select: { discipulado: { select: { redeId: true } } } } } },
                            discipulados: { select: { redeId: true } },
                            redes: { select: { id: true } },
                            congregacoesVicePresidente: { select: { redes: { select: { id: true } } } },
                            congregacoesPastorGoverno: { select: { redes: { select: { id: true } } } },
                            congregacoesKidsLeader: { select: { redes: { select: { id: true, isKids: true } } } }
                        }
                    });
                    if (!member) {
                        throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
                    }
                    if (member.ledCelulas && member.ledCelulas.length > 0) {
                        member.ledCelulas.forEach(c => {
                            if (c.discipulado?.redeId && !redesIds.includes(c.discipulado.redeId)) {
                                redesIds.push(c.discipulado.redeId);
                            }
                        });
                    }
                    if (member.leadingInTrainingCelulas && member.leadingInTrainingCelulas.length > 0) {
                        member.leadingInTrainingCelulas.forEach(c => {
                            if (c.celula?.discipulado?.redeId && !redesIds.includes(c.celula.discipulado.redeId)) {
                                redesIds.push(c.celula.discipulado.redeId);
                            }
                        });
                    }
                    if (member.discipulados && member.discipulados.length > 0) {
                        member.discipulados.forEach(d => {
                            if (d.redeId && !redesIds.includes(d.redeId)) {
                                redesIds.push(d.redeId);
                            }
                        });
                    }
                    if (member.redes && member.redes.length > 0) {
                        member.redes.forEach(r => {
                            if (r.id && !redesIds.includes(r.id)) {
                                redesIds.push(r.id);
                            }
                        });
                    }
                    if (member.congregacoesVicePresidente && member.congregacoesVicePresidente.length > 0) {
                        member.congregacoesVicePresidente.forEach(c => {
                            c.redes.forEach(r => {
                                if (!redesIds.includes(r.id)) {
                                    redesIds.push(r.id);
                                }
                            });
                        });
                    }
                    if (member.congregacoesPastorGoverno && member.congregacoesPastorGoverno.length > 0) {
                        member.congregacoesPastorGoverno.forEach(c => {
                            c.redes.forEach(r => {
                                if (!redesIds.includes(r.id)) {
                                    redesIds.push(r.id);
                                }
                            });
                        });
                    }
                    if (member.congregacoesKidsLeader && member.congregacoesKidsLeader.length > 0) {
                        member.congregacoesKidsLeader.forEach(c => {
                            c.redes.forEach(r => {
                                if (r.isKids && !redesIds.includes(r.id)) {
                                    redesIds.push(r.id);
                                }
                            });
                        });
                    }
                    if (redesIds.length > 0) {
                        where.id = { in: redesIds };
                    } else {
                        where.id = -1;
                    }
                }
            }

            const redes = await this.prisma.rede.findMany({
                where,
                include: {
                    pastor: true,
                    congregacao: true,
                    discipulados: {
                        include: {
                            discipulador: { omit: { password: true } },
                            celulas: true
                        }
                    }

                },
                orderBy: {
                    name: 'asc'
                }
            });
            redes.forEach(rede => {
                this.cloudFrontService.transformPhotoUrl(rede.pastor)
                rede.discipulados?.forEach(d => this.cloudFrontService.transformPhotoUrl(d.discipulador));
            });
            return redes;
        } catch (error) {
            throw new HttpException('Erro ao listar redes: ' + error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async create(data: RedeData.RedeCreateInput, permission: LoadedPermission) {
        try {
            const validator = createMatrixValidator(this.prisma);

            // Validate congregacao belongs to same matrix
            await validator.validateCongregacaoBelongsToMatrix(data.congregacaoId, data.matrixId!);

            // Check permissions
            if (!permission.isAdmin) {
                // Pastor of principal congregacao can create redes
                const principalCongregacao = await this.prisma.congregacao.findFirst({
                    where: {
                        matrixId: data.matrixId!,
                        isPrincipal: true,
                        OR: [
                            { pastorGovernoMemberId: permission.id },
                            { vicePresidenteMemberId: permission.id }
                        ]
                    }
                });

                // Pastores de congregação podem criar redes para sua congregação
                if (!principalCongregacao && !permission.congregacaoIds.includes(data.congregacaoId)) {
                    throw new HttpException('Apenas administradores e pastores de congregação podem criar redes', HttpStatus.FORBIDDEN);
                }
            }

            if (data.pastorMemberId) {
                // Validate pastor belongs to same matrix
                await validator.validateMemberBelongsToMatrix(data.pastorMemberId, data.matrixId!);

                const pastor = await this.prisma.member.findUnique({
                    where: { id: data.pastorMemberId },
                    include: { ministryPosition: true }
                });
                if (!pastor) {
                    throw new BadRequestException('Pastor não encontrado');
                }
                if (!canBePastor(pastor.ministryPosition?.type)) {
                    throw new BadRequestException(
                        `Membro não pode ser pastor de rede. Nível ministerial atual: ${getMinistryTypeLabel(pastor.ministryPosition?.type)}. ` +
                        `É necessário ser Pastor.`
                    );
                }
                // Validar gênero para redes Kids
                if (data.isKids && pastor.gender !== 'FEMALE') {
                    throw new BadRequestException(
                        'Redes Kids devem ter responsável do gênero feminino'
                    );
                }
            }
            return this.prisma.rede.create({
                data: {
                    name: data.name,
                    congregacaoId: data.congregacaoId,
                    pastorMemberId: data.pastorMemberId,
                    matrixId: data.matrixId!,
                    isKids: data.isKids ?? false
                }
            });
        } catch (error) {
            throw new HttpException('Erro ao criar rede: ' + error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async update(id: number, data: Partial<RedeData.RedeCreateInput>, matrixId: number, permission: LoadedPermission) {
        try {
            const validator = createMatrixValidator(this.prisma);

            // Validate the rede being updated belongs to the matrix
            await validator.validateRedeBelongsToMatrix(id, matrixId);

            const rede = await this.prisma.rede.findUnique({ where: { id } });
            if (!rede) {
                throw new BadRequestException('Rede não encontrada');
            }

            // Check permissions
            if (!permission.isAdmin) {
                // Pastor of principal congregacao can edit all redes
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

                // Pastores de congregação podem editar redes da sua congregação
                // Pastores de rede podem editar sua própria rede
                if (!principalCongregacao &&
                    !permission.congregacaoIds.includes(rede.congregacaoId) &&
                    !permission.redeIds.includes(id)) {
                    throw new HttpException('Você não tem permissão para editar esta rede', HttpStatus.FORBIDDEN);
                }
            }

            // Validate congregacao if being changed
            if (data.congregacaoId !== undefined) {
                await validator.validateCongregacaoBelongsToMatrix(data.congregacaoId, matrixId);
            }

            if (data.pastorMemberId !== undefined && data.pastorMemberId !== null) {
                // Validate pastor belongs to same matrix
                await validator.validateMemberBelongsToMatrix(data.pastorMemberId, matrixId);

                const pastor = await this.prisma.member.findUnique({
                    where: { id: data.pastorMemberId },
                    include: { ministryPosition: true }
                });
                if (!pastor) {
                    throw new BadRequestException('Pastor não encontrado');
                }
                if (!canBePastor(pastor.ministryPosition?.type)) {
                    throw new BadRequestException(
                        `Membro não pode ser pastor de rede. Nível ministerial atual: ${getMinistryTypeLabel(pastor.ministryPosition?.type)}. ` +
                        `É necessário ser Pastor.`
                    );
                }
                // Validar gênero para redes Kids
                const isKidsRede = data.isKids !== undefined ? data.isKids : rede.isKids;
                if (isKidsRede && pastor.gender !== 'FEMALE') {
                    throw new BadRequestException(
                        'Redes Kids devem ter responsável do gênero feminino'
                    );
                }
            }

            // Se estiver marcando como Kids, validar o pastor atual (se não estiver sendo alterado)
            if (data.isKids && !rede.isKids && rede.pastorMemberId && data.pastorMemberId === undefined) {
                const currentPastor = await this.prisma.member.findUnique({
                    where: { id: rede.pastorMemberId }
                });
                if (currentPastor && currentPastor.gender !== 'FEMALE') {
                    throw new BadRequestException(
                        'Não é possível marcar esta rede como Kids. O responsável atual não é do gênero feminino. ' +
                        'Remova o responsável ou altere para um membro do gênero feminino.'
                    );
                }
            }

            return this.prisma.rede.update({
                where: { id },
                data: {
                    name: data.name,
                    congregacaoId: data.congregacaoId,
                    pastorMemberId: data.pastorMemberId,
                    isKids: data.isKids
                }
            });
        } catch (error) {
            throw new HttpException('Erro ao atualizar rede: ' + error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async delete(id: number, permission: LoadedPermission) {
        try {
            // Check permissions
            if (!permission.isAdmin) {
                const rede = await this.prisma.rede.findUnique({
                    where: { id },
                    include: { congregacao: true }
                });

                if (!rede) {
                    throw new BadRequestException('Rede não encontrada');
                }

                // Pastor of principal congregacao can delete redes
                const principalCongregacao = await this.prisma.congregacao.findFirst({
                    where: {
                        matrixId: rede.matrixId,
                        isPrincipal: true,
                        OR: [
                            { pastorGovernoMemberId: permission.id },
                            { vicePresidenteMemberId: permission.id }
                        ]
                    }
                });

                if (!principalCongregacao) {
                    throw new HttpException('Apenas administradores e pastores da congregação principal podem deletar redes', HttpStatus.FORBIDDEN);
                }
            }

            const count = await this.prisma.discipulado.count({ where: { redeId: id } });
            if (count > 0) {
                throw new BadRequestException('Rede possui discipulados vinculados');
            }

            return this.prisma.rede.delete({ where: { id } });
        } catch (error) {
            throw new HttpException('Erro ao deletar rede: ' + error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
