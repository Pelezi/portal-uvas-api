import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common';
import { RedeCreateInput } from '../model/rede.input';
import { canBePastor, getMinistryTypeLabel } from '../../common/helpers/ministry-permissions.helper';

@Injectable()
export class RedeService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        return this.prisma.rede.findMany({ 
            include: {
                pastor: true
            },
            orderBy: { 
                name: 'asc' 
            } 
        });
    }

    public async create(data: RedeCreateInput) {
        if (data.pastorMemberId) {
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
        return this.prisma.rede.create({ data: { name: data.name, pastorMemberId: data.pastorMemberId } });
    }

    public async update(id: number, data: Partial<RedeCreateInput>) {
        if (data.pastorMemberId !== undefined && data.pastorMemberId !== null) {
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
        return this.prisma.rede.update({ where: { id }, data: { name: data.name, pastorMemberId: data.pastorMemberId } });
    }

    public async delete(id: number) {
        const count = await this.prisma.discipulado.count({ where: { redeId: id } });
        if (count > 0) {
            throw new BadRequestException('Rede possui discipulados vinculados');
        }

        return this.prisma.rede.delete({ where: { id } });
    }

}
