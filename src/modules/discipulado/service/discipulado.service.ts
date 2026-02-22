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

        const requestingMemberInfo = await this.prisma.member.findUnique({
            where: { id: requestingMemberId },
            include: {
                ministryPosition: true,
                ledCelulas: true,
            }
        });

        const isLeaderOrHigher = requestingMemberInfo?.ministryPosition?.type === 'LEADER' 
            || requestingMemberInfo?.ministryPosition?.type === 'DISCIPULADOR' 
            || requestingMemberInfo?.ministryPosition?.type === 'PASTOR';
        
        if (filters) {
            // Build OR conditions for permission-based filtering
            if (!filters.all && isLeaderOrHigher) {
                // Leaders, discipuladores, and pastors can see discipulados from the células they lead
                const celulaDiscipuladoIds = requestingMemberInfo.ledCelulas.map(c => c.discipuladoId);
                
                if (celulaDiscipuladoIds.length > 0) {
                    where.OR = [
                        { id: { in: celulaDiscipuladoIds } },
                    ];
                }
            }
            
            // Add discipuladoIds to OR conditions (e.g., discipulados where user is a disciple in Kids rede)
            if (filters.discipuladoIds && filters.discipuladoIds.length > 0) {
                where.OR = [
                    ...(where.OR || []),
                    { id: { in: filters.discipuladoIds.map(Number) } },
                ];
            }
            
            // If not showing all and no permission conditions were added, return empty result
            if (!filters.all && (!where.OR || where.OR.length === 0)) {
                where.id = { equals: -1 }; // No discipulados accessible
            }
            
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
