import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class ReportService {
    constructor(private readonly prisma: PrismaService) {}

    public async create(cellId: number, memberIds: number[]) {
        const nowUtc = new Date();
        const brazilOffsetHours = 3;

        const nowBrazil = new Date(nowUtc.getTime() - brazilOffsetHours * 60 * 60 * 1000);

        const startBrazilLocal = new Date(nowBrazil);
        startBrazilLocal.setHours(0, 0, 0, 0);
        const endBrazilLocal = new Date(nowBrazil);
        endBrazilLocal.setHours(23, 59, 59, 999);

        const startUtc = new Date(startBrazilLocal.getTime() + brazilOffsetHours * 60 * 60 * 1000);
        const endUtc = new Date(endBrazilLocal.getTime() + brazilOffsetHours * 60 * 60 * 1000);

        await this.prisma.report.deleteMany({ where: { cellId, createdAt: { gte: startUtc, lte: endUtc } } });

        const report = await this.prisma.report.create({ data: { cellId } });

        const attendances = memberIds.map(mid => ({ reportId: report.id, memberId: mid }));
        if (attendances.length > 0) {
            await this.prisma.reportAttendance.createMany({ data: attendances });
        }

        return this.findById(report.id);
    }

    public async findById(id: number) {
        return this.prisma.report.findUnique({ where: { id }, include: { attendances: { include: { member: true } } } });
    }

    public async findByCell(cellId: number) {
        return this.prisma.report.findMany({ where: { cellId }, orderBy: { createdAt: 'desc' }, include: { attendances: { include: { member: true } } } });
    }

    public async presences(cellId: number) {
        const reports = await this.prisma.report.findMany({
            where: { cellId },
            orderBy: { createdAt: 'desc' },
            include: { attendances: { include: { member: true } } }
        });

        return reports.map(r => ({
            date: r.createdAt,
            members: (r.attendances || []).map(a => a.member)
        }));
    }

}
