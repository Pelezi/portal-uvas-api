import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService) {}

    public async findAll() {
        return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
    }

    public async findById(id: number) {
        return this.prisma.role.findUnique({ where: { id } });
    }

    public async create(name: string, isAdmin: boolean = false) {
        return this.prisma.role.create({ data: { name, isAdmin } });
    }

    public async update(id: number, name: string, isAdmin?: boolean) {
        const data: Prisma.RoleUpdateInput = { 
            name,
            ...(typeof isAdmin !== 'undefined' && { isAdmin })
        };
        return this.prisma.role.update({ where: { id }, data });
    }

    public async delete(id: number) {
        return this.prisma.role.delete({ where: { id } });
    }
}
