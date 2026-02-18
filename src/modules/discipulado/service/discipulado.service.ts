import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common';
import { canBeDiscipulador, getMinistryTypeLabel } from '../../common/helpers/ministry-permissions.helper';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';
import { LoadedPermission } from '../../common/security/permission.service';
import * as DiscipuladoData from '../model';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class DiscipuladoService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll(matrixId: number, filters?: DiscipuladoData.DiscipuladoFilterInput) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const where: Prisma.DiscipuladoWhereInput = { matrixId };

        if (filters) {
            if (filters.congregacaoId) {
                where.rede = { congregacaoId: Number(filters.congregacaoId) };
            }
            if (filters.redeId) {
                where.redeId = Number(filters.redeId);
            }
            if (filters.discipuladorMemberId) {
                where.discipuladorMemberId = Number(filters.discipuladorMemberId);
            }
            if (filters.discipuladoIds && filters.discipuladoIds.length > 0) {
                where.id = { in: filters.discipuladoIds.map(Number) };
            }
        }
        
        return this.prisma.discipulado.findMany({
            where,
            include: { 
                rede: true, 
                discipulador: true 
            },
            orderBy: { 
                discipulador: { name: 'asc' }
            } 
        });
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
        return this.prisma.discipulado.create({ 
            data: { 
                redeId: data.redeId, 
                discipuladorMemberId: data.discipuladorMemberId,
                matrixId: data.matrixId!
            } 
        });
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
        return this.prisma.discipulado.update({ where: { id }, data: { redeId: data.redeId, discipuladorMemberId: data.discipuladorMemberId } });
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
            throw new HttpException('Você não tem permissão para deletar este discipulado', HttpStatus.FORBIDDEN);
        }
        
        const count = await this.prisma.celula.count({ where: { discipuladoId: id } });
        if (count > 0) {
            throw new BadRequestException('Discipulado possui células vinculadas');
        }

        return this.prisma.discipulado.delete({ where: { id } });
    }

}
