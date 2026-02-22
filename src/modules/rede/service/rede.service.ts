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

            const requestingMemberInfo = await this.prisma.member.findUnique({
                where: { id: requestingMemberId },
                include: {
                    ministryPosition: true,
                    ledCelulas: { include: { discipulado: true } },
                    discipulados: true
                }
            });

            const isLeaderOrHigher = requestingMemberInfo?.ministryPosition?.type === 'LEADER' 
                || requestingMemberInfo?.ministryPosition?.type === 'DISCIPULADOR' 
                || requestingMemberInfo?.ministryPosition?.type === 'PASTOR';

            if (filters) {
                // Build OR conditions for permission-based filtering
                if (!filters.all && isLeaderOrHigher) {
                    // Leaders, discipuladores, and pastors can see redes from células they lead and discipulados they manage
                    const redeIdsFromCelulas = requestingMemberInfo.ledCelulas.map(c => c.discipulado.redeId);
                    const redeIdsFromDiscipulados = requestingMemberInfo.discipulados.map(d => d.redeId);
                    const redeIdsFromUser = [...new Set([...redeIdsFromCelulas, ...redeIdsFromDiscipulados])];
                    
                    if (redeIdsFromUser.length > 0) {
                        where.OR = [
                            { id: { in: redeIdsFromUser } },
                        ];
                    }
                }
                
                // Add redeIds filter to OR conditions
                if (filters.redeIds && filters.redeIds.length > 0) {
                    where.OR = [
                        ...(where.OR || []),
                        { id: { in: filters.redeIds.map(Number) } },
                    ];
                }
                
                // If not showing all and no permission conditions were added, return empty result
                if (!filters.all && (!where.OR || where.OR.length === 0)) {
                    where.id = { equals: -1 }; // No redes accessible
                }
                
                // Apply additional filters that narrow down the results (AND conditions with OR above)
                if (filters.congregacaoId) {
                    where.congregacaoId = Number(filters.congregacaoId);
                }
                if (filters.pastorMemberId) {
                    where.pastorMemberId = Number(filters.pastorMemberId);
                }
            }

            const redes = await this.prisma.rede.findMany({
                where,
                include: {
                    pastor: true,
                    congregacao: true,
                    discipulados: { include: { 
                        discipulador: { omit: { password: true } },
                        celulas: true
                    } }

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
