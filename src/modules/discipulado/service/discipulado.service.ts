import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common';
import { DiscipuladoCreateInput } from '../model/discipulado.input';

@Injectable()
export class DiscipuladoService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        return this.prisma.discipulado.findMany({ 
            include: { 
                rede: true, 
                discipulador: true 
            },
            orderBy: { 
                discipulador: { firstName: 'asc' }
            } 
        });
    }

    public async create(data: DiscipuladoCreateInput) {
        return this.prisma.discipulado.create({ 
            data: { 
                redeId: data.redeId, 
                discipuladorUserId: data.discipuladorUserId 
            } 
        });
    }

    public async update(id: number, data: Partial<DiscipuladoCreateInput>) {
        return this.prisma.discipulado.update({ where: { id }, data: { redeId: data.redeId, discipuladorUserId: data.discipuladorUserId } });
    }

    public async delete(id: number) {
        const count = await this.prisma.celula.count({ where: { discipuladoId: id } });
        if (count > 0) {
            throw new BadRequestException('Discipulado possui células vinculadas');
        }

        return this.prisma.discipulado.delete({ where: { id } });
    }

}
