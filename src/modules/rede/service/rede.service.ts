import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common';
import { RedeCreateInput } from '../model/rede.input';

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
        return this.prisma.rede.create({ data: { name: data.name, pastorUserId: data.pastorUserId } });
    }

    public async update(id: number, data: Partial<RedeCreateInput>) {
        return this.prisma.rede.update({ where: { id }, data: { name: data.name, pastorUserId: data.pastorUserId } });
    }

    public async delete(id: number) {
        const count = await this.prisma.discipulado.count({ where: { redeId: id } });
        if (count > 0) {
            throw new BadRequestException('Rede possui discipulados vinculados');
        }

        return this.prisma.rede.delete({ where: { id } });
    }

}
