import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { Prisma, $Enums } from '../../../generated/prisma/client';

@Injectable()
export class MinistryService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        return this.prisma.ministry.findMany({ orderBy: { priority: 'asc' } });
    }

    public async findById(id: number) {
        return this.prisma.ministry.findUnique({ where: { id } });
    }

    public async create(name: string, type?: $Enums.MinistryType) {
        const maxPriority = await this.prisma.ministry.findFirst({ orderBy: { priority: 'desc' } });
        const priority = maxPriority ? maxPriority.priority + 1 : 0;
        const data: Prisma.MinistryCreateInput = { 
            name, 
            priority,
            ...(type && { type })
        };
        return this.prisma.ministry.create({ data });
    }

    public async update(id: number, name: string, type?: $Enums.MinistryType) {
        const data: Prisma.MinistryUpdateInput = { 
            name,
            ...(type && { type })
        };
        return this.prisma.ministry.update({ where: { id }, data });
    }

    public async updatePriority(id: number, priority: number) {
        return this.prisma.ministry.update({ where: { id }, data: { priority } });
    }

    public async delete(id: number) {
        return this.prisma.ministry.delete({ where: { id } });
    }
}
