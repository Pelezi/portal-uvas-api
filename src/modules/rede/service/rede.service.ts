import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common';
import { RedeCreateInput } from '../model/rede.input';
import { canBePastor, getMinistryTypeLabel } from '../../common/helpers/ministry-permissions.helper';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';
import { LoadedPermission } from '../../common/security/permission.service';
import { RedeWhereInput } from '../../../generated/prisma/models';

@Injectable()
export class RedeService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll(matrixId: number, permission?: LoadedPermission | null) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const where: RedeWhereInput = { matrixId };
        
        // Pastores de congregação (não-admin e não-principal) só veem redes da sua congregação
        if (permission && !permission.isAdmin && permission.congregacaoIds && permission.congregacaoIds.length > 0) {
            // Check if user is pastor of principal congregacao
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

            // If not pastor of principal, filter to only their congregacoes redes
            if (!principalCongregacao) {
                where.congregacaoId = { in: permission.congregacaoIds };
            }
        }
        // Pastores de rede (não-admin) só podem ver suas próprias redes
        else if (permission && !permission.isAdmin && permission.redeIds && permission.redeIds.length > 0) {
            where.id = { in: permission.redeIds };
        }
        
        return this.prisma.rede.findMany({
            where,
            include: {
                pastor: true,
                congregacao: true
            },
            orderBy: { 
                name: 'asc' 
            } 
        });
    }

    public async create(data: RedeCreateInput, permission: LoadedPermission) {
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
        }
        return this.prisma.rede.create({ 
            data: { 
                name: data.name, 
                congregacaoId: data.congregacaoId,
                pastorMemberId: data.pastorMemberId, 
                matrixId: data.matrixId! 
            } 
        });
    }

    public async update(id: number, data: Partial<RedeCreateInput>, matrixId: number, permission: LoadedPermission) {
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
        }
        return this.prisma.rede.update({ 
            where: { id }, 
            data: { 
                name: data.name, 
                congregacaoId: data.congregacaoId,
                pastorMemberId: data.pastorMemberId 
            } 
        });
    }

    public async delete(id: number, permission: LoadedPermission) {
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
    }

}
