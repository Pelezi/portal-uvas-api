import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class MemberService {
    constructor(private readonly prisma: PrismaService) {}

    public async findActiveByCell(cellId: number) {
        return this.prisma.member.findMany({ where: { cellId, status: 'ACTIVE' }, orderBy: { name: 'asc' } });
    }

    public async create(cellId: number, name: string) {
        return this.prisma.member.create({ data: { name, cellId, status: 'ACTIVE' } });
    }

    public async inactivate(memberId: number) {
        return this.prisma.member.update({ where: { id: memberId }, data: { status: 'INACTIVE' } });
    }

}
