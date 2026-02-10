import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common';
import { CongregacaoCreateInput, CongregacaoUpdateInput } from '../model/congregacao.input';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';
import { LoadedPermission } from '../../common/security/permission.service';
import { CongregacaoWhereInput } from '../../../generated/prisma/models';

@Injectable()
export class CongregacaoService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll(matrixId: number, permission?: LoadedPermission | null) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const where: CongregacaoWhereInput = { matrixId };
        
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
        
        return this.prisma.congregacao.findMany({
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

        return this.prisma.congregacao.findUnique({
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
    }

    public async create(data: CongregacaoCreateInput, permission: LoadedPermission) {
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

        return this.prisma.congregacao.create({
            data: {
                name: data.name,
                matrixId: data.matrixId!,
                pastorGovernoMemberId: data.pastorGovernoMemberId,
                vicePresidenteMemberId: data.vicePresidenteMemberId,
                isPrincipal: data.isPrincipal ?? false,
                country: data.country,
                zipCode: data.zipCode,
                street: data.street,
                streetNumber: data.streetNumber,
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
    }

    public async update(id: number, data: CongregacaoUpdateInput, matrixId: number, permission: LoadedPermission) {
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

        return this.prisma.congregacao.update({
            where: { id },
            data: {
                name: data.name,
                pastorGovernoMemberId: data.pastorGovernoMemberId,
                vicePresidenteMemberId: data.vicePresidenteMemberId,
                isPrincipal: data.isPrincipal,
                country: data.country,
                zipCode: data.zipCode,
                street: data.street,
                streetNumber: data.streetNumber,
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
