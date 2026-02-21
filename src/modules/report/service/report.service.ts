import { Injectable } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import { Prisma } from '../../../generated/prisma/client';
import { LoadedPermission } from '../../common/security/permission.service';
import * as ReportData from '../model';
import { CelulaWhereInput } from '../../../generated/prisma/models';

@Injectable()
export class ReportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudFrontService: CloudFrontService
    ) {}

    public async create(celulaId: number, memberIds: number[], matrixId: number, date?: string, type?: 'CELULA' | 'CULTO') {
        const brazilOffsetHours = 3;

        let startUtc: Date;
        let endUtc: Date;

        if (date) {
            // date expected in YYYY-MM-DD
            const parts = date.split('-').map(p => Number(p));
            const y = parts[0];
            const m = parts[1];
            const d = parts[2];
            const startBrazilUtcMillis = Date.UTC(y, m - 1, d, 0, 0, 0) + brazilOffsetHours * 60 * 60 * 1000;
            const endBrazilUtcMillis = Date.UTC(y, m - 1, d, 23, 59, 59, 999) + brazilOffsetHours * 60 * 60 * 1000;
            startUtc = new Date(startBrazilUtcMillis);
            endUtc = new Date(endBrazilUtcMillis);
        } else {
            const nowUtc = new Date();
            const nowBrazil = new Date(nowUtc.getTime() - brazilOffsetHours * 60 * 60 * 1000);
            const startBrazilLocal = new Date(nowBrazil);
            startBrazilLocal.setHours(0, 0, 0, 0);
            const endBrazilLocal = new Date(nowBrazil);
            endBrazilLocal.setHours(23, 59, 59, 999);
            startUtc = new Date(startBrazilLocal.getTime() + brazilOffsetHours * 60 * 60 * 1000);
            endUtc = new Date(endBrazilLocal.getTime() + brazilOffsetHours * 60 * 60 * 1000);
        }

        // Deletar apenas relatórios do mesmo tipo na mesma data
        await this.prisma.report.deleteMany({ 
            where: { 
                celulaId, 
                createdAt: { gte: startUtc, lte: endUtc },
                type: type || 'CELULA'
            } 
        });

        const createData: Partial<Prisma.ReportCreateInput> & { celula: { connect: { id: number } }; matrix: { connect: { id: number } } } = { 
            celula: { connect: { id: celulaId } },
            matrix: { connect: { id: matrixId } },
            type: type || 'CELULA',
            ...(date && { createdAt: startUtc })
        };

        const report = await this.prisma.report.create({ data: createData });

        const attendances = memberIds.map(mid => ({ reportId: report.id, memberId: mid }));
        if (attendances.length > 0) {
            await this.prisma.reportAttendance.createMany({ data: attendances });
        }

        return this.findById(report.id);
    }

    public async findById(id: number) {
        const report = await this.prisma.report.findUnique({ where: { id }, include: { attendances: { include: { member: true } } } });
        if (report?.attendances) {
            report.attendances.forEach(a => this.cloudFrontService.transformPhotoUrl(a.member));
        }
        return report;
    }

    public async findByDateAndType(celulaId: number, date: string, type: 'CELULA' | 'CULTO', matrixId: number) {
        const brazilOffsetHours = 3;
        const parts = date.split('-').map(p => Number(p));
        const y = parts[0];
        const m = parts[1];
        const d = parts[2];
        const startBrazilUtcMillis = Date.UTC(y, m - 1, d, 0, 0, 0) + brazilOffsetHours * 60 * 60 * 1000;
        const endBrazilUtcMillis = Date.UTC(y, m - 1, d, 23, 59, 59, 999) + brazilOffsetHours * 60 * 60 * 1000;
        const startUtc = new Date(startBrazilUtcMillis);
        const endUtc = new Date(endBrazilUtcMillis);

        const report = await this.prisma.report.findFirst({
            where: {
                celulaId,
                matrixId,
                type,
                createdAt: { gte: startUtc, lte: endUtc }
            },
            include: { attendances: { include: { member: true } } }
        });

        if (report?.attendances) {
            report.attendances.forEach(a => this.cloudFrontService.transformPhotoUrl(a.member));
        }
        return report;
    }

    public async getReportDatesByCelula(celulaId: number, matrixId: number) {
        const brazilOffsetHours = 3;
        
        // Buscar todos os relatórios da célula
        const reports = await this.prisma.report.findMany({
            where: {
                celulaId,
                matrixId
            },
            select: {
                createdAt: true,
                type: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Converter datas UTC para datas do Brasil (YYYY-MM-DD)
        const celulaDates: string[] = [];
        const cultoDates: string[] = [];

        for (const report of reports) {
            const brazilDate = new Date(report.createdAt.getTime() - brazilOffsetHours * 60 * 60 * 1000);
            const year = brazilDate.getUTCFullYear();
            const month = brazilDate.getUTCMonth() + 1;
            const day = brazilDate.getUTCDate();
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (report.type === 'CELULA') {
                if (!celulaDates.includes(dateStr)) {
                    celulaDates.push(dateStr);
                }
            } else if (report.type === 'CULTO') {
                if (!cultoDates.includes(dateStr)) {
                    cultoDates.push(dateStr);
                }
            }
        }

        return {
            celulaDates,
            cultoDates
        };
    }

    public async findByCelula(celulaId: number, matrixId: number) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const reports = await this.prisma.report.findMany({ 
            where: { 
                celulaId,
                matrixId  // Verify report belongs to correct matrix
            }, 
            orderBy: { createdAt: 'desc' }, 
            include: { attendances: { include: { member: true } } } 
        });
        reports.forEach(report => {
            if (report.attendances) {
                report.attendances.forEach(a => this.cloudFrontService.transformPhotoUrl(a.member));
            }
        });
        return reports;
    }

    public async presences(celulaId: number, matrixId: number) {
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const reports = await this.prisma.report.findMany({
            where: { 
                celulaId,
                matrixId  // Verify report belongs to correct matrix
            },
            orderBy: { createdAt: 'desc' },
            include: { attendances: { include: { member: true } } }
        });

        return reports.map(r => {
            const members = (r.attendances || []).map(a => a.member);
            this.cloudFrontService.transformPhotoUrls(members);
            return {
                date: r.createdAt,
                members
            };
        });
    }

    public async reportsByMonth(celulaId: number, year: number, month: number, matrixId: number) {
        const brazilOffsetHours = 3;
        
        // Calcular início e fim do mês em UTC
        const startBrazilUtcMillis = Date.UTC(year, month - 1, 1, 0, 0, 0) + brazilOffsetHours * 60 * 60 * 1000;
        const endBrazilUtcMillis = Date.UTC(year, month, 0, 23, 59, 59, 999) + brazilOffsetHours * 60 * 60 * 1000;
        const startUtc = new Date(startBrazilUtcMillis);
        const endUtc = new Date(endBrazilUtcMillis);

        // Buscar todos os relatórios do mês
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const reports = await this.prisma.report.findMany({
            where: { 
                celulaId,
                matrixId,  // Verify report belongs to correct matrix
                createdAt: {
                    gte: startUtc,
                    lte: endUtc
                }
            },
            orderBy: { createdAt: 'asc' },
            include: { 
                attendances: { 
                    include: { 
                        member: {
                            include: {
                                ministryPosition: true
                            }
                        } 
                    } 
                } 
            }
        });

        // Buscar todos os membros da célula
        const allMembers = await this.prisma.member.findMany({
            where: { celulaId },
            orderBy: { name: 'asc' },
            include: {
                ministryPosition: true
            }
        });

        // Transform photoUrls
        this.cloudFrontService.transformPhotoUrls(allMembers);
        reports.forEach(r => {
            if (r.attendances) {
                r.attendances.forEach(a => this.cloudFrontService.transformPhotoUrl(a.member));
            }
        });

        // Transformar os dados para incluir presentes e ausentes
        const reportsData = reports.map(r => {
            const presentIds = new Set((r.attendances || []).map(a => a.memberId));
            const present = (r.attendances || []).map(a => a.member);
            const absent = allMembers.filter(m => !presentIds.has(m.id));

            return {
                date: r.createdAt,
                present,
                absent
            };
        });

        return {
            reports: reportsData,
            allMembers
        };
    }

    public async reportsByMonthMultipleCelulas(
        permission: LoadedPermission,
        year: number,
        month: number,
        filters: ReportData.ReportFilterInput,
        matrixId: number
    ) {
        const brazilOffsetHours = 3;
        
        // Build where clause for celulas based on filters and permissions
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        let celulaWhere: CelulaWhereInput = { matrixId };
        
        // Apply filter (priority: célula > discipulado > rede > congregação)
        if (filters.celulaId) {
            celulaWhere.id = Number(filters.celulaId);
        } else if (filters.discipuladoId) {
            celulaWhere.discipuladoId = Number(filters.discipuladoId);
        } else if (filters.redeId) {
            celulaWhere.discipulado = { redeId: Number(filters.redeId) };
        } else if (filters.congregacaoId) {
            celulaWhere.discipulado = { rede: { congregacaoId: Number(filters.congregacaoId) } };
        }
        
        // Apply permissions if not admin
        if (!permission?.isAdmin && permission?.ministryType !== 'PRESIDENT_PASTOR') {
            // Build permission-based OR conditions
            const permissionConditions: any[] = [];
            
            // Direct celula access
            if (permission.celulaIds && permission.celulaIds.length > 0) {
                permissionConditions.push({ id: { in: permission.celulaIds.map(Number) } });
            }
            
            // Discipulado access
            if (permission.discipuladoIds && permission.discipuladoIds.length > 0) {
                permissionConditions.push({ discipuladoId: { in: permission.discipuladoIds.map(Number) } });
            }
            
            // Rede access
            if (permission.redeIds && permission.redeIds.length > 0) {
                permissionConditions.push({ discipulado: { redeId: { in: permission.redeIds.map(Number) } } });
            }
            
            // Congregação access
            if (permission.congregacaoIds && permission.congregacaoIds.length > 0) {
                permissionConditions.push({ 
                    discipulado: { 
                        rede: { 
                            congregacaoId: { in: permission.congregacaoIds.map(Number) } 
                        } 
                    } 
                });
            }
            
            // Combine filter with permissions
            if (permissionConditions.length > 0) {
                if (Object.keys(celulaWhere).length > 0) {
                    // Both filter and permissions - need AND (filter AND permissions)
                    celulaWhere = {
                        AND: [
                            celulaWhere,
                            { OR: permissionConditions }
                        ]
                    };
                } else {
                    // Only permissions - use OR
                    celulaWhere = { OR: permissionConditions };
                }
            } else {
                // No permissions at all - return empty result
                celulaWhere = { id: -1 };
            }
        }
        // If admin and no filter, celulaWhere remains {} which means all celulas
        
        // Calcular início e fim do mês em UTC
        const startBrazilUtcMillis = Date.UTC(year, month - 1, 1, 0, 0, 0) + brazilOffsetHours * 60 * 60 * 1000;
        const endBrazilUtcMillis = Date.UTC(year, month, 0, 23, 59, 59, 999) + brazilOffsetHours * 60 * 60 * 1000;
        const startUtc = new Date(startBrazilUtcMillis);
        const endUtc = new Date(endBrazilUtcMillis);

        // Buscar todas as células com informações do discipulado e dia da semana
        const celulas = await this.prisma.celula.findMany({
            where: celulaWhere,
            include: {
                discipulado: {
                    include: {
                        rede: true,
                        discipulador: true
                    }
                }
            }
        });
        
        const celulaIds = celulas.map(c => c.id);

        // Buscar todos os relatórios do mês para essas células
        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        const reports = await this.prisma.report.findMany({
            where: { 
                celulaId: { in: celulaIds },
                matrixId,  
                createdAt: {
                    gte: startUtc,
                    lte: endUtc
                }
            },
            orderBy: { createdAt: 'asc' },
            include: { 
                celula: true,
                attendances: { 
                    include: { 
                        member: {
                            include: {
                                ministryPosition: true
                            }
                        } 
                    } 
                } 
            }
        });

        // Buscar todos os membros de todas as células
        // MANDATORY: Filter by matrixId through member-matrix relationship for defense in depth
        const allMembers = await this.prisma.member.findMany({
            where: { 
                celulaId: { in: celulaIds },
                matrices: {
                    some: {
                        matrixId
                    }
                }
            },
            orderBy: [{ celulaId: 'asc' }, { name: 'asc' }],
            include: {
                ministryPosition: true,
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                rede: true
                            }
                        }
                    }
                }
            }
        });

        // Transform photoUrls for all members and report attendances
        this.cloudFrontService.transformPhotoUrls(allMembers);
        reports.forEach(report => {
            if (report.attendances) {
                report.attendances.forEach(a => this.cloudFrontService.transformPhotoUrl(a.member));
            }
        });

        // Agrupar relatórios por célula
        const reportsByCelula = new Map<number, typeof reports>();
        for (const celulaId of celulaIds) {
            reportsByCelula.set(celulaId, reports.filter(r => r.celulaId === celulaId));
        }

        // Gerar todas as datas válidas do mês para cada célula (baseado no weekday)
        // MAIS: incluir datas onde existem relatórios mesmo que não sejam do weekday padrão
        const allValidDates = new Map<number, Date[]>();
        
        // Helper: converter data UTC para string de data Brasil
        const getDateStrBrazil = (utcDate: Date): string => {
            const brazilDate = new Date(utcDate.getTime() - brazilOffsetHours * 60 * 60 * 1000);
            const year = brazilDate.getUTCFullYear();
            const month = brazilDate.getUTCMonth() + 1;
            const day = brazilDate.getUTCDate();
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        };
        
        // Helper: obter dia da semana no Brasil
        const getWeekdayBrazil = (utcDate: Date): number => {
            const brazilDate = new Date(utcDate.getTime() - brazilOffsetHours * 60 * 60 * 1000);
            return brazilDate.getUTCDay();
        };
        
        for (const celula of celulas) {
            const datesMap = new Map<string, Date>(); // dateStr -> UTC Date
            
            if (celula.weekday !== null && celula.weekday !== undefined) {
                // Gerar todas as ocorrências do dia da semana no mês
                const daysInMonth = new Date(year, month, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const dayOfWeek = new Date(year, month - 1, day).getDay();
                    if (dayOfWeek === celula.weekday) {
                        const dateUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + brazilOffsetHours * 60 * 60 * 1000);
                        const dateStr = getDateStrBrazil(dateUtc);
                        datesMap.set(dateStr, dateUtc);
                    }
                }
            }
            
            // Adicionar datas onde existem relatórios (mesmo fora do weekday padrão)
            const celulaReports = reportsByCelula.get(celula.id) || [];
            for (const report of celulaReports) {
                const dateStr = getDateStrBrazil(report.createdAt);
                if (!datesMap.has(dateStr)) {
                    datesMap.set(dateStr, report.createdAt);
                }
            }
            
            // Converter para array e ordenar
            const dates = Array.from(datesMap.values()).sort((a, b) => a.getTime() - b.getTime());
            allValidDates.set(celula.id, dates);
        }

        // Transformar os dados
        const celulasData = celulas.map(celula => {
            const celulaReports = reportsByCelula.get(celula.id) || [];
            const celulaMembers = allMembers.filter(m => m.celulaId === celula.id);
            const validDates = allValidDates.get(celula.id) || [];

            // Criar um mapa de relatórios por data (usando data do Brasil)
            const reportsByDate = new Map<string, typeof celulaReports[0]>();
            for (const report of celulaReports) {
                const dateStr = getDateStrBrazil(report.createdAt);
                reportsByDate.set(dateStr, report);
            }

            // Para cada data válida, criar um relatório (mesmo que não exista)
            const reportsData = validDates.map(validDate => {
                const dateStr = getDateStrBrazil(validDate);
                const report = reportsByDate.get(dateStr);

                if (report) {
                    // Usar a data do relatório para calcular isStandardDay
                    const weekdayOfReport = getWeekdayBrazil(report.createdAt);
                    const isStandardDay = celula.weekday === null || celula.weekday === undefined ? true : weekdayOfReport === celula.weekday;
                    
                    const presentIds = new Set((report.attendances || []).map(a => a.memberId));
                    const present = (report.attendances || []).map(a => a.member);
                    const absent = celulaMembers.filter(m => !presentIds.has(m.id));
                    
                    return {
                        date: report.createdAt,
                        present,
                        absent,
                        hasReport: true,
                        isStandardDay
                    };
                } else {
                    // Data sem relatório - usar validDate
                    const weekdayOfDate = getWeekdayBrazil(validDate);
                    const isStandardDay = celula.weekday === null || celula.weekday === undefined ? true : weekdayOfDate === celula.weekday;
                    
                    return {
                        date: validDate,
                        present: [],
                        absent: celulaMembers,
                        hasReport: false,
                        isStandardDay
                    };
                }
            });

            // Transform photoUrls for celula members  
            this.cloudFrontService.transformPhotoUrls(celulaMembers);

            return {
                celula: {
                    id: celula.id,
                    name: celula.name,
                    weekday: celula.weekday,
                    time: celula.time,
                    discipulado: celula.discipulado
                },
                reports: reportsData,
                allMembers: celulaMembers
            };
        });

        return {
            celulas: celulasData,
            allMembers
        };
    }

}
