import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class MemberService {
    constructor(private readonly prisma: PrismaService) {}

    public async findActiveByCelula(celulaId: number) {
        return this.prisma.member.findMany({ where: { celulaId, status: 'MEMBER' }, orderBy: { name: 'asc' } });
    }

    public async create(celulaId: number, name: string) {
        return this.prisma.member.create({ data: { name, celulaId, status: 'MEMBER' } });
    }

    public async inactivate(memberId: number) {
        return this.prisma.member.update({ where: { id: memberId }, data: { status: 'INACTIVE' } });
    }

    public async update(memberId: number, data: { name?: string; status?: string; maritalStatus?: string }) {
        const payload: any = {};
        if (typeof data.name !== 'undefined') payload.name = data.name;
        if (typeof data.status !== 'undefined') payload.status = data.status;
        if (typeof data.maritalStatus !== 'undefined') payload.maritalStatus = data.maritalStatus;
        return this.prisma.member.update({ where: { id: memberId }, data: payload });
    }

}
