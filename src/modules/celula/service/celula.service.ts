import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService, CloudFrontService } from '../../common';
import * as CelulaData from '../model';
import { canBeLeader, getMinistryTypeLabel } from '../../common/helpers/ministry-permissions.helper';
import { Prisma } from '../../../generated/prisma/client';
import { createMatrixValidator } from '../../common/helpers/matrix-validation.helper';

// Função auxiliar para limpar campos string que podem vir como number
function cleanStringField(value: string | number | undefined | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    // Converter número para string se necessário
    return typeof value === 'number' ? String(value) : value;
}

@Injectable()
export class CelulaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudFrontService: CloudFrontService
    ) { }

    public async findAll(matrixId: number, requestingMemberId: number, filters?: CelulaData.CelulaFilterInput) {

        let where: Prisma.CelulaWhereInput = { matrixId };

        if (filters) {
            if (filters.name) {
                where.name = { contains: filters.name, mode: 'insensitive' };
            }
            if (filters.leaderInTrainingMemberId) {
                where.leadersInTraining = { some: { memberId: Number(filters.leaderInTrainingMemberId) } };
            }
            if (filters.leaderMemberId) {
                where.leaderMemberId = Number(filters.leaderMemberId);
            }
            if (filters.discipuladoId) {
                where.discipuladoId = Number(filters.discipuladoId);
            }
            if (filters.redeId && filters.congregacaoId) {
                where.discipulado = {
                    redeId: Number(filters.redeId),
                    rede: { congregacaoId: Number(filters.congregacaoId) }
                };
            } else if (filters.redeId) {
                where.discipulado = { redeId: Number(filters.redeId) };
            } else if (filters.congregacaoId) {
                where.discipulado = { rede: { congregacaoId: Number(filters.congregacaoId) } };
            }
            if (filters.celulaIds && filters.celulaIds.length > 0) {
                where.id = { in: filters.celulaIds.map(Number) };
            } else if (!!!filters.all) {
                let celulaIds: number[] = [];
                // Se all for false e celulaIds não for fornecido, usar as células do próprio usuário
                const member = await this.prisma.member.findUnique({
                    include: {
                        ledCelulas: { select: { id: true } },
                        leadingInTrainingCelulas: { select: { celulaId: true } },
                        discipulados: { include: { celulas: { select: { id: true } } } },
                        redes: { include: { discipulados: { include: { celulas: { select: { id: true } } } } } },
                        congregacoesVicePresidente: { include: { redes: { include: { discipulados: { include: { celulas: { select: { id: true } } } } } } } },
                        congregacoesPastorGoverno: { include: { redes: { include: { discipulados: { include: { celulas: { select: { id: true } } } } } } } },
                        congregacoesKidsLeader: { include: { redes: { include: { discipulados: { include: { celulas: { select: { id: true } } } } } } } },
                    },
                    where: { id: requestingMemberId }
                });
                if (!member) {
                    throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
                }
                if (member.ledCelulas && member.ledCelulas.length > 0) {
                    // if user is leader, add their led celulas to celulasIds, if it doesn't already exist
                    member.ledCelulas.forEach(c => {
                        if (!celulaIds.includes(c.id)) {
                            celulaIds.push(c.id);
                        }
                    });
                }
                if (member.leadingInTrainingCelulas && member.leadingInTrainingCelulas.length > 0) {
                    // if user is vice leader, add their vice led celulas to celulasIds, if it doesn't already exist
                    member.leadingInTrainingCelulas.forEach(c => {
                        if (!celulaIds.includes(c.celulaId)) {
                            celulaIds.push(c.celulaId);
                        }
                    });
                }
                if (member.discipulados && member.discipulados.length > 0) {
                    member.discipulados.forEach(d => {
                        d.celulas.forEach(c => {
                            if (!celulaIds.includes(c.id)) {
                                celulaIds.push(c.id);
                            }
                        });
                    });
                }
                if (member.redes && member.redes.length > 0) {
                    member.redes.forEach(r => {
                        r.discipulados.forEach(d => {
                            d.celulas.forEach(c => {
                                if (!celulaIds.includes(c.id)) {
                                    celulaIds.push(c.id);
                                }
                            });
                        });
                    });
                }
                if (member.congregacoesVicePresidente && member.congregacoesVicePresidente.length > 0) {
                    member.congregacoesVicePresidente.forEach(c => {
                        c.redes.forEach(r => {
                            r.discipulados.forEach(d => {
                                d.celulas.forEach(cel => {
                                    if (!celulaIds.includes(cel.id)) {
                                        celulaIds.push(cel.id);
                                    }
                                });
                            });
                        });
                    });
                }
                if (member.congregacoesPastorGoverno && member.congregacoesPastorGoverno.length > 0) {
                    member.congregacoesPastorGoverno.forEach(c => {
                        c.redes.forEach(r => {
                            r.discipulados.forEach(d => {
                                d.celulas.forEach(cel => {
                                    if (!celulaIds.includes(cel.id)) {
                                        celulaIds.push(cel.id);
                                    }
                                });
                            });
                        });
                    });
                }
                if (member.congregacoesKidsLeader && member.congregacoesKidsLeader.length > 0) {
                    member.congregacoesKidsLeader.forEach(c => {
                        c.redes.forEach(r => {
                            if (r.isKids) {
                                r.discipulados.forEach(d => {
                                    d.celulas.forEach(cel => {
                                        if (!celulaIds.includes(cel.id)) {
                                            celulaIds.push(cel.id);
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
                if (celulaIds.length > 0) {
                    where.id = { in: celulaIds };
                } else {
                    // Se não houver células associadas, garantir que a consulta retorne vazia
                    where.id = -1; // ID inválido para garantir que nenhuma célula seja retornada
                }
            }
        }

        const celulas = await this.prisma.celula.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                leader: { omit: { password: true } },
                host: { omit: { password: true } },
                leadersInTraining: { include: { member: { omit: { password: true } } } },
                discipulado: {
                    include: {
                        rede: { include: { congregacao: true } },
                        discipulador: true
                    }
                },
                parallelCelula: { include: { leader: { omit: { password: true } } } }
            }
        });
        celulas.forEach(celula => {
            this.cloudFrontService.transformPhotoUrl(celula.leader);
            this.cloudFrontService.transformPhotoUrl(celula.host);
            celula.leadersInTraining?.forEach(lit => this.cloudFrontService.transformPhotoUrl(lit.member));
            if (celula.parallelCelula) this.cloudFrontService.transformPhotoUrl((celula.parallelCelula as any).leader);
        });
        return celulas;
    }

    public async findByPermission(celulaIds: number[]) {
        if (celulaIds.length === 0) return [];

        const celulas = await this.prisma.celula.findMany({
            where: { id: { in: celulaIds } },
            include: {
                leader: { omit: { password: true } },
                leadersInTraining: { include: { member: { omit: { password: true } } } }
            },
            orderBy: { name: 'asc' }
        });
        celulas.forEach(celula => {
            this.cloudFrontService.transformPhotoUrl(celula.leader);
            celula.leadersInTraining?.forEach(lit => this.cloudFrontService.transformPhotoUrl(lit.member));
        });
        return celulas;
    }

    public async create(body: CelulaData.CelulaCreateInput, matrixId: number) {
        const validator = createMatrixValidator(this.prisma);

        // Validação de weekday
        if (body.weekday === undefined || body.weekday === null) {
            throw new HttpException('Dia da semana é obrigatório', HttpStatus.BAD_REQUEST);
        }
        if (body.weekday < 0 || body.weekday > 6) {
            throw new HttpException('Dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)', HttpStatus.BAD_REQUEST);
        }
        if (!body.leaderMemberId) {
            throw new HttpException('Líder é obrigatório', HttpStatus.BAD_REQUEST);
        }
        if (!body.discipuladoId) {
            throw new HttpException('Discipulado é obrigatório', HttpStatus.BAD_REQUEST);
        }

        // Validação de time
        if (!body.time) {
            throw new HttpException('Horário é obrigatório', HttpStatus.BAD_REQUEST);
        }
        // Valida formato HH:mm
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(body.time)) {
            throw new HttpException('Horário deve estar no formato HH:mm (ex: 19:30)', HttpStatus.BAD_REQUEST);
        }

        // Validate discipulado belongs to same matrix
        await validator.validateDiscipuladoBelongsToMatrix(body.discipuladoId, matrixId);

        // Validate leader belongs to same matrix
        await validator.validateMemberBelongsToMatrix(body.leaderMemberId, matrixId);

        const leader = await this.prisma.member.findUnique({
            where: { id: body.leaderMemberId },
            include: { ministryPosition: true }
        });
        if (!leader) {
            throw new HttpException('Líder não encontrado', HttpStatus.BAD_REQUEST);
        }
        if (!canBeLeader(leader.ministryPosition?.type)) {
            throw new HttpException(
                `Membro não pode ser líder de célula. Nível ministerial atual: ${getMinistryTypeLabel(leader.ministryPosition?.type)}. ` +
                `É necessário ser pelo menos Líder.`,
                HttpStatus.BAD_REQUEST
            );
        }

        const data: Prisma.CelulaUncheckedCreateInput = {
            name: body.name,
            weekday: body.weekday,
            time: body.time,
            leaderMemberId: body.leaderMemberId,
            hostMemberId: body.hostMemberId,
            discipuladoId: body.discipuladoId,
            matrixId,
            openingDate: body.openingDate ? new Date(body.openingDate) : undefined,
            hasNextHost: body.hasNextHost,
            type: body.type as any,
            level: body.level as any,
            country: body.country,
            zipCode: cleanStringField(body.zipCode),
            street: body.street,
            streetNumber: cleanStringField(body.streetNumber),
            neighborhood: body.neighborhood,
            city: body.city,
            complement: body.complement,
            state: body.state,
            parallelCelulaId: body.parallelCelulaId ?? null,
        };

        const celula = await this.prisma.celula.create({ data: data, include: { leader: { omit: { password: true } }, host: { omit: { password: true } }, discipulado: true, parallelCelula: { include: { leader: { omit: { password: true } } } } } });
        this.cloudFrontService.transformPhotoUrl(celula.leader);
        this.cloudFrontService.transformPhotoUrl(celula.host);
        return celula;
    }

    public async findById(id: number) {
        const celula = await this.prisma.celula.findUnique({
            where: { id },
            include: {
                leader: { omit: { password: true } },
                host: { omit: { password: true } },
                discipulado: true
            }
        });
        if (celula) {
            this.cloudFrontService.transformPhotoUrl(celula.leader);
            this.cloudFrontService.transformPhotoUrl(celula.host);
        }
        return celula;
    }

    public async findMembersByCelulaId(celulaId: number) {
        const members = await this.prisma.member.findMany({
            where: { celulaId },
            orderBy: { name: 'asc' },
            include: {
                ministryPosition: true,
                winnerPath: true,
                roles: { include: { role: true } },
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                rede: true,
                                discipulador: { omit: { password: true } }
                            }
                        }
                    }
                },
                leadingInTrainingCelulas: true
            }
        });
        this.cloudFrontService.transformPhotoUrls(members);
        members.forEach(m => {
            this.cloudFrontService.transformPhotoUrl(m.celula?.discipulado?.discipulador);
        });
        return members;
    }

    public async update(id: number, data: CelulaData.CelulaUpdateInput, matrixId: number) {
        const validator = createMatrixValidator(this.prisma);

        // Validate the celula being updated belongs to the matrix
        await validator.validateCelulaBelongsToMatrix(id, matrixId);

        const updateData: Prisma.CelulaUncheckedUpdateInput = {};
        if (data.name !== undefined) updateData.name = data.name;

        // Validação de weekday
        if (data.weekday !== undefined) {
            if (data.weekday !== null && (data.weekday < 0 || data.weekday > 6)) {
                throw new HttpException('Dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)', HttpStatus.BAD_REQUEST);
            }
            updateData.weekday = data.weekday;
        }

        // Validação de time
        if (data.time !== undefined) {
            if (data.time !== null && data.time !== '') {
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(data.time)) {
                    throw new HttpException('Horário deve estar no formato HH:mm (ex: 19:30)', HttpStatus.BAD_REQUEST);
                }
            }
            updateData.time = data.time;
        }

        // Address fields
        if (data.country !== undefined) updateData.country = data.country;
        if (data.zipCode !== undefined) updateData.zipCode = cleanStringField(data.zipCode);
        if (data.street !== undefined) updateData.street = data.street;
        if (data.streetNumber !== undefined) updateData.streetNumber = cleanStringField(data.streetNumber);
        if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
        if (data.city !== undefined) updateData.city = data.city;
        if (data.complement !== undefined) updateData.complement = data.complement;
        if (data.state !== undefined) updateData.state = data.state;

        // New fields
        if (data.hostMemberId !== undefined) {
            if (data.hostMemberId !== null) {
                await validator.validateMemberBelongsToMatrix(data.hostMemberId, matrixId);
            }
            updateData.hostMemberId = data.hostMemberId;
        }
        if (data.openingDate !== undefined) {
            updateData.openingDate = data.openingDate ? new Date(data.openingDate) : null;
        }
        if (data.hasNextHost !== undefined) updateData.hasNextHost = data.hasNextHost;
        if (data.type !== undefined) updateData.type = data.type as any;
        if (data.level !== undefined) updateData.level = data.level as any;
        if (data.parallelCelulaId !== undefined) updateData.parallelCelulaId = data.parallelCelulaId ?? null;

        if (data.leaderMemberId !== undefined) {
            if (data.leaderMemberId !== null) {
                // Validate leader belongs to same matrix
                await validator.validateMemberBelongsToMatrix(data.leaderMemberId, matrixId);

                const leader = await this.prisma.member.findUnique({
                    where: { id: data.leaderMemberId },
                    include: { ministryPosition: true }
                });
                if (!leader) {
                    throw new HttpException('Líder não encontrado', HttpStatus.BAD_REQUEST);
                }
                if (!canBeLeader(leader.ministryPosition?.type)) {
                    throw new HttpException(
                        `Membro não pode ser líder de célula. Nível ministerial atual: ${getMinistryTypeLabel(leader.ministryPosition?.type)}. ` +
                        `É necessário ser pelo menos Líder.`,
                        HttpStatus.BAD_REQUEST
                    );
                }
            }
            updateData.leaderMemberId = data.leaderMemberId;
        }

        // Atualizar discipulado se fornecido
        if (data.discipuladoId !== undefined) {
            if (data.discipuladoId !== null) {
                // Validate discipulado belongs to same matrix
                await validator.validateDiscipuladoBelongsToMatrix(data.discipuladoId, matrixId);

                const discipulado = await this.prisma.discipulado.findUnique({
                    where: { id: data.discipuladoId }
                });
                if (!discipulado) {
                    throw new HttpException('Discipulado não encontrado', HttpStatus.BAD_REQUEST);
                }
            }
            updateData.discipuladoId = data.discipuladoId;
        }

        await this.prisma.celula.update({ where: { id }, data: updateData });

        // Atualizar líderes em treinamento se fornecidos
        if (data.leaderInTrainingIds !== undefined) {
            // Remover todos os líderes em treinamento existentes
            await this.prisma.celulaLeaderInTraining.deleteMany({
                where: { celulaId: id }
            });

            // Adicionar novos líderes em treinamento
            if (data.leaderInTrainingIds.length > 0) {
                const celula = await this.prisma.celula.findUnique({
                    include: {
                        discipulado: {
                            include: {
                                rede: true
                            }
                        }
                    },
                    where: { id }
                });
                // Validar que todos os membros pertencem à célula
                const members = await this.prisma.member.findMany({
                    where: {
                        id: { in: data.leaderInTrainingIds },
                        celulaId: id
                    },
                    include: { ministryPosition: true }
                });

                if (members.length !== data.leaderInTrainingIds.length && !!!celula?.discipulado?.rede?.isKids) {
                    throw new HttpException('Alguns membros selecionados não pertencem a esta célula', HttpStatus.BAD_REQUEST);
                }

                // Verificar se algum membro é o líder
                if (!celula) {
                    throw new HttpException('Célula não encontrada', HttpStatus.NOT_FOUND);
                }
                const isLeader = data.leaderInTrainingIds.some((memberId: number) => memberId === celula.leaderMemberId);
                if (isLeader) {
                    throw new HttpException('O líder da célula não pode ser líder em treinamento', HttpStatus.BAD_REQUEST);
                }

                // Criar as associações de líderes em treinamento
                await this.prisma.celulaLeaderInTraining.createMany({
                    data: data.leaderInTrainingIds.map((memberId: number) => ({
                        celulaId: id,
                        memberId
                    }))
                });

                // Atualizar cargo ministerial para LEADER_IN_TRAINING se necessário
                const ministryTypeHierarchy = ['VISITOR', 'REGULAR_ATTENDEE', 'MEMBER'];
                for (const member of members) {
                    const currentType = member.ministryPosition?.type;
                    if (currentType && ministryTypeHierarchy.includes(currentType)) {
                        // Buscar cargo de LEADER_IN_TRAINING na mesma matriz
                        const leaderInTrainingMinistry = await this.prisma.ministry.findFirst({
                            where: {
                                matrixId,
                                type: 'LEADER_IN_TRAINING'
                            }
                        });

                        if (leaderInTrainingMinistry) {
                            await this.prisma.member.update({
                                where: { id: member.id },
                                data: { ministryPositionId: leaderInTrainingMinistry.id }
                            });
                        }
                    }
                }
            }
        }

        const celula = await this.prisma.celula.findUnique({
            where: { id },
            include: {
                leader: { omit: { password: true } },
                discipulado: { include: { rede: true } },
                leadersInTraining: { include: { member: { omit: { password: true } } } }
            }
        });
        if (celula) {
            this.cloudFrontService.transformPhotoUrl(celula.leader);
            celula.leadersInTraining?.forEach(lit => this.cloudFrontService.transformPhotoUrl(lit.member));
        }
        return celula;
    }

    /**
     * Multiply (split) a celula: create a new celula and move specified members from the original celula
     */
    public async multiply(
        originalCelulaId: number,
        memberIds: number[],
        newCelulaName: string,
        matrixId: number,
        newLeaderMemberId?: number,
        oldLeaderMemberId?: number,
    ) {
        try {
            return this.prisma.$transaction(async (tx) => {
                const original = await tx.celula.findUnique({ where: { id: originalCelulaId } });
                if (!original) {
                    throw new HttpException('Célula original não encontrada', HttpStatus.NOT_FOUND);
                }

                if (!oldLeaderMemberId) {
                    throw new HttpException('Líder original é obrigatório ao multiplicar célula', HttpStatus.BAD_REQUEST);
                }

                if (!newLeaderMemberId) {
                    throw new HttpException('Novo líder é obrigatório ao multiplicar célula', HttpStatus.BAD_REQUEST);
                }

                const leader = await tx.member.findUnique({
                    where: { id: newLeaderMemberId },
                    include: { ministryPosition: true }
                });
                if (!leader) {
                    throw new HttpException('Novo líder não encontrado', HttpStatus.BAD_REQUEST);
                }

                // Se o membro não tem ministry adequado para ser líder, promove automaticamente
                if (!canBeLeader(leader.ministryPosition.type)) {
                    // Busca uma Ministry com type LEADER
                    let leaderMinistry = await tx.ministry.findFirst({
                        where: { type: 'LEADER' }
                    });

                    // Se não existir, cria uma
                    if (!leaderMinistry) {
                        throw new HttpException('Posição ministerial para Líder não encontrada. Contate o administrador do sistema.', HttpStatus.INTERNAL_SERVER_ERROR);
                    }

                    // Atualiza o membro para ter a posição de Líder
                    await tx.member.update({
                        where: { id: newLeaderMemberId },
                        data: { ministryPositionId: leaderMinistry.id }
                    });
                }

                const originalCelulaInfo = await tx.celula.findUnique({
                    where: { id: originalCelulaId },
                    select: { weekday: true, time: true }
                });

                // create new celula
                const createData: Prisma.CelulaUncheckedCreateInput = {
                    name: newCelulaName,
                    discipuladoId: original.discipuladoId,
                    leaderMemberId: oldLeaderMemberId,
                    matrixId,
                    weekday: originalCelulaInfo?.weekday,
                    time: originalCelulaInfo?.time
                };
                const newCelula = await tx.celula.create({
                    data: createData,
                    include: { leader: { omit: { password: true } } }
                });

                // Update original celula to the new leader
                await tx.celula.update({
                    where: { id: originalCelulaId },
                    data: { leaderMemberId: newLeaderMemberId }
                });

                // Remove celulaId from both leaders if they were in the original celula
                const newLeader = await tx.member.findUnique({ where: { id: newLeaderMemberId }, include: { ministryPosition: true } });
                if (newLeader && newLeader.celulaId === originalCelulaId) {
                    await tx.member.update({
                        where: { id: newLeaderMemberId },
                        data: { celulaId: null }
                    });
                }
                const oldLeader = await tx.member.findUnique({ where: { id: oldLeaderMemberId }, include: { ministryPosition: true } });
                if (oldLeader && oldLeader.celulaId === originalCelulaId) {
                    await tx.member.update({
                        where: { id: oldLeaderMemberId },
                        data: { celulaId: null }
                    });
                }

                // update both leaders ministry type to leader if they are leader in training
                if (newLeader && newLeader.ministryPosition?.type === 'LEADER_IN_TRAINING') {
                    const leaderMinistry = await tx.ministry.findFirst({ where: { type: 'LEADER' } });
                    if (leaderMinistry) {
                        await tx.member.update({
                            where: { id: newLeaderMemberId },
                            data: { ministryPositionId: leaderMinistry.id }
                        });
                    }
                }
                if (oldLeader && oldLeader.ministryPosition?.type === 'LEADER_IN_TRAINING') {
                    const leaderMinistry = await tx.ministry.findFirst({ where: { type: 'LEADER' } });
                    if (leaderMinistry) {
                        await tx.member.update({
                            where: { id: oldLeaderMemberId },
                            data: { ministryPositionId: leaderMinistry.id }
                        });
                    }
                }

                // ensure members belong to the original celula
                const validMembers = await tx.member.findMany({ where: { id: { in: memberIds }, celulaId: originalCelulaId } });
                const validIds = validMembers.map(m => m.id);

                if (validIds.length === 0) {
                    throw new HttpException('Nenhum membro válido foi selecionado para ser movido para a nova célula', HttpStatus.BAD_REQUEST);
                }

                await tx.member.updateMany({ where: { id: { in: validIds } }, data: { celulaId: newCelula.id } });

                return {
                    newCelula,
                    movedCount: validIds.length,
                    movedMemberIds: validIds
                };
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            const status = (typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number') ? error.status : HttpStatus.BAD_REQUEST;
            throw new HttpException(`Erro ao multiplicar célula: ${message}`, status);
        }
    }

    public async delete(id: number): Promise<void> {
        // Do not allow deletion if there are any members at all
        const memberCount = await this.prisma.member.count({ where: { celulaId: id } });
        if (memberCount > 0) {
            throw new HttpException('Esta célula possui membros vinculados e não pode ser excluída.', HttpStatus.BAD_REQUEST);
        }

        // safe to delete
        await this.prisma.report.deleteMany({ where: { celulaId: id } });
        await this.prisma.celula.delete({ where: { id } });
    }

}
