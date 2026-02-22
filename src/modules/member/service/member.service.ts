import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EmailService, PrismaService, PermissionService, CloudFrontService } from '../../common';
import { SecurityConfigService } from '../../config/service/security-config.service';
import { AuthService } from '../../auth/auth.service';
import { MatrixService } from '../../matrix/service/matrix.service';
import { AwsService } from '../../common/provider/aws.provider';

import * as MemberData from '../model';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import sharp from 'sharp';

import { firstValueFrom } from 'rxjs';
import { File } from 'fastify-multer/lib/interfaces';

import * as PrismaModels from '../../../generated/prisma/models';

interface SetPasswordPayload extends jwt.JwtPayload {
    userId: number;
    purpose: string;
}


// Função auxiliar para limpar datas
function cleanDateField(dateStr: string | undefined): Date | null | undefined {
    if (dateStr === undefined) return undefined;
    if (!dateStr || !dateStr.trim()) return null;

    // Se já é uma data válida ISO, adicionar horário para garantir formato completo
    const trimmed = dateStr.trim();
    // Verificar se é apenas data (yyyy-mm-dd) e adicionar hora
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return new Date(trimmed + 'T00:00:00.000Z');
    }
    // Se já tem horário, converter para Date
    return new Date(trimmed);
}

// Função auxiliar para limpar telefone (remover caracteres não numéricos)
function cleanPhoneField(phone: string | undefined | null): string | null | undefined {
    if (phone === undefined) return undefined;
    if (!phone) return null;
    // Garantir que phone é uma string
    const phoneStr = typeof phone === 'string' ? phone : String(phone);
    if (!phoneStr.trim()) return null;
    // Remove tudo que não é dígito
    return phoneStr.replace(/\D/g, '');
}

// Função auxiliar para limpar campos string que podem vir como number
function cleanStringField(value: string | number | undefined | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    // Converter número para string se necessário
    return typeof value === 'number' ? String(value) : value;
}

@Injectable()
export class MemberService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly securityConfig: SecurityConfigService,
        private readonly permissionService: PermissionService,
        private readonly httpService: HttpService,
        private readonly matrixService: MatrixService,
        private readonly awsService: AwsService,
        private readonly cloudFrontService: CloudFrontService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) { }

    public async findAll(matrixId: number, requestingMemberId: number, filters?: MemberData.MemberFilterInput) {
        const where: PrismaModels.MemberWhereInput = {
            matrices: {
                some: {
                    matrixId: matrixId
                }
            }
        };

        if (filters) {
            // celulaId = 0 significa "sem célula" (celulaId is null)
            if (filters.celulaId !== undefined) {
                if (filters.celulaId == 0) {
                    where.celulaId = null;
                    where.ledCelulas = { none: {} };
                    where.leadingInTrainingCelulas = { none: {} };
                    where.discipulados = { none: {} };
                    where.redes = { none: {} };
                    where.congregacoesPastorGoverno = { none: {} };
                    where.congregacoesVicePresidente = { none: {} };
                } else {
                    where.celulaId = Number(filters.celulaId);
                }
            } else {

                const celulaMemberFilter: PrismaModels.CelulaWhereInput = {};
                const celulaLeaderFilter: PrismaModels.CelulaWhereInput = {};
                const discipuladoLeaderFilter: PrismaModels.DiscipuladoWhereInput = {};
                const redeLeaderFilter: PrismaModels.RedeWhereInput = {};
                const congregacaoLeaderFilter: PrismaModels.CongregacaoWhereInput = {};

                // Build nested discipulado filter for celula members
                const discipuladoMemberFilter: PrismaModels.DiscipuladoWhereInput = {};

                if (filters.congregacaoId) {
                    const congregacaoId = Number(filters.congregacaoId);

                    // For members in celulas
                    discipuladoMemberFilter.rede = {
                        congregacaoId: congregacaoId
                    };

                    // For celula leaders
                    celulaLeaderFilter.discipulado = {
                        rede: {
                            congregacaoId: congregacaoId
                        }
                    };

                    // For discipulado leaders
                    discipuladoLeaderFilter.rede = {
                        congregacaoId: congregacaoId
                    };

                    // For rede leaders
                    redeLeaderFilter.congregacaoId = congregacaoId;

                    // For congregacao leaders
                    congregacaoLeaderFilter.id = congregacaoId;
                }

                if (filters.redeId) {
                    const redeId = Number(filters.redeId);

                    // For members in celulas
                    discipuladoMemberFilter.redeId = redeId;

                    // For celula leaders - merge with existing discipulado filter
                    if (celulaLeaderFilter.discipulado) {
                        (celulaLeaderFilter.discipulado as PrismaModels.DiscipuladoWhereInput).redeId = redeId;
                    } else {
                        celulaLeaderFilter.discipulado = {
                            redeId: redeId
                        };
                    }

                    // For discipulado leaders
                    discipuladoLeaderFilter.redeId = redeId;

                    // For rede leaders
                    redeLeaderFilter.id = redeId;
                }

                if (filters.discipuladoId) {
                    const discipuladoId = Number(filters.discipuladoId);

                    // For members in celulas
                    celulaMemberFilter.discipuladoId = discipuladoId;

                    // For celula leaders
                    celulaLeaderFilter.discipuladoId = discipuladoId;

                    // For discipulado leaders
                    discipuladoLeaderFilter.id = discipuladoId;
                }

                // Build OR conditions to include both members and leaders
                const orConditions: PrismaModels.MemberWhereInput[] = [];

                // Members in celulas
                if (Object.keys(discipuladoMemberFilter).length > 0) {
                    celulaMemberFilter.discipulado = discipuladoMemberFilter;
                }
                if (Object.keys(celulaMemberFilter).length > 0) {
                    orConditions.push({ celula: celulaMemberFilter });
                }

                // Leaders of celulas
                if (Object.keys(celulaLeaderFilter).length > 0) {
                    orConditions.push({ ledCelulas: { some: celulaLeaderFilter } });
                    orConditions.push({ leadingInTrainingCelulas: { some: {celula: celulaLeaderFilter} } });
                }

                // Leaders of discipulados
                if (Object.keys(discipuladoLeaderFilter).length > 0) {
                    orConditions.push({ discipulados: { some: discipuladoLeaderFilter } });
                }

                // Leaders of redes
                if (Object.keys(redeLeaderFilter).length > 0) {
                    orConditions.push({ redes: { some: redeLeaderFilter } });
                }

                // Leaders of congregacoes
                if (Object.keys(congregacaoLeaderFilter).length > 0) {
                    orConditions.push({ congregacoesPastorGoverno: { some: congregacaoLeaderFilter } });
                    orConditions.push({ congregacoesVicePresidente: { some: congregacaoLeaderFilter } });
                }

                // Apply OR conditions if we have any
                if (orConditions.length > 0) {
                    where.OR = orConditions;
                }

                // Apply name filter separately (not part of OR)
                if (filters.name) {
                    where.name = {
                        contains: filters.name,
                        mode: 'insensitive'
                    };
                }

                if (filters.isActive !== undefined) {
                    where.isActive = filters.isActive;
                }
            }

            // Filtrar por tipo de ministério (para selecionar pastores, discipuladores, líderes)
            if (filters.ministryType) {
                const ministryTypes = filters.ministryType.split(',');
                where.ministryPosition = {
                    type: { in: ministryTypes as any }
                };
            }

            // Filtrar por gênero
            if (filters.gender) {
                where.gender = filters.gender as any;
            }

            // Filtrar por discípulos de um membro específico
            if (filters.discipleOfId) {
                where.discipleOf = {
                    some: {
                        discipuladoId: Number(filters.discipleOfId)
                    }
                };
            }

            // Apply hierarchy filter if filters.all is false
            if (!!!filters.all && requestingMemberId) {
                const hierarchyConditions = await this.buildHierarchyFilter(requestingMemberId);

                if (hierarchyConditions.length > 0) {
                    if (where.OR) {
                        // Both hierarchy and other OR filters exist, combine with AND
                        where.AND = [
                            { OR: where.OR },
                            { OR: hierarchyConditions }
                        ];
                        delete where.OR;
                    } else {
                        // Only hierarchy filter
                        where.OR = hierarchyConditions;
                    }
                }
            }
        }

        const response = await this.prisma.member.findMany({
            where,
            include: {
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                rede: true,
                                discipulador: true
                            }
                        }
                    }
                },
                ledCelulas: true,
                leadingInTrainingCelulas:  {
                    include: {
                        celula: true
                    }
                },
                discipulados: {
                    include: {
                        rede: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                redes: true,
                congregacoesPastorGoverno: true,
                congregacoesVicePresidente: true,
                roles: {
                    include: { role: true }
                },
                discipleOf: true,
                ministryPosition: true
            },
            orderBy: { name: 'asc' }
        });

        // replace photoUrl with full CloudFront URL if it exists
        this.cloudFrontService.transformPhotoUrls(response);

        return response;
    }

    public async findByCelula(celulaId: number) {
        return await this.prisma.member.findMany({
            where: { celulaId },
            include: {
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                rede: true,
                                discipulador: true
                            }
                        }
                    }
                },
                roles: {
                    include: { role: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Build hierarchy filter to restrict members to those under the requesting user's leadership
     */
    private async buildHierarchyFilter(requestingMemberId: number): Promise<PrismaModels.MemberWhereInput[]> {
        const requestingMember = await this.prisma.member.findUnique({
            where: { id: requestingMemberId },
            include: {
                ledCelulas: true,
                leadingInTrainingCelulas: {
                    include: {
                        celula: true
                    }
                },
                discipulados: {
                    include: {
                        celulas: true
                    }
                },
                redes: {
                    include: {
                        discipulados: {
                            include: {
                                celulas: true
                            }
                        }
                    }
                },
                congregacoesPastorGoverno: true,
                congregacoesVicePresidente: true
            }
        });

        if (!requestingMember) {
            return [];
        }

        const hierarchyConditions: PrismaModels.MemberWhereInput[] = [];

        // 1. Members and leaders in células led by requesting user
        const ledCelulaIds = requestingMember.ledCelulas.map(c => c.id);
        const leadingInTrainingCelulaIds = requestingMember.leadingInTrainingCelulas.map(c => c.id);
        const allCelulaIds = [...ledCelulaIds, ...leadingInTrainingCelulaIds];

        if (allCelulaIds.length > 0) {
            // Members in these células
            hierarchyConditions.push({ celulaId: { in: allCelulaIds } });
            // Leaders of these células
            hierarchyConditions.push({ ledCelulas: { some: { id: { in: allCelulaIds } } } });
            hierarchyConditions.push({ leadingInTrainingCelulas: { some: { id: { in: allCelulaIds } } } });
        }

        // 2. Members and leaders in discipulados led by requesting user
        if (requestingMember.discipulados.length > 0) {
            const discipuladoIds = requestingMember.discipulados.map(d => d.id);
            const celulaIdsFromDiscipulados = requestingMember.discipulados.flatMap(d => d.celulas.map(c => c.id));

            // Members in células of these discipulados
            if (celulaIdsFromDiscipulados.length > 0) {
                hierarchyConditions.push({ celulaId: { in: celulaIdsFromDiscipulados } });
                // Leaders of these células
                hierarchyConditions.push({ ledCelulas: { some: { id: { in: celulaIdsFromDiscipulados } } } });
                hierarchyConditions.push({ leadingInTrainingCelulas: { some: { id: { in: celulaIdsFromDiscipulados } } } });
            }

            // The discipuladores themselves
            hierarchyConditions.push({ discipulados: { some: { id: { in: discipuladoIds } } } });
        }

        // 3. Members and leaders in redes led by requesting user
        if (requestingMember.redes.length > 0) {
            const redeIds = requestingMember.redes.map(r => r.id);
            const discipuladoIdsFromRedes = requestingMember.redes.flatMap(r => r.discipulados.map(d => d.id));
            const celulaIdsFromRedes = requestingMember.redes.flatMap(r =>
                r.discipulados.flatMap(d => d.celulas.map(c => c.id))
            );

            // Members in células of these redes
            if (celulaIdsFromRedes.length > 0) {
                hierarchyConditions.push({ celulaId: { in: celulaIdsFromRedes } });
                // Leaders of these células
                hierarchyConditions.push({ ledCelulas: { some: { id: { in: celulaIdsFromRedes } } } });
                hierarchyConditions.push({ leadingInTrainingCelulas: { some: { id: { in: celulaIdsFromRedes } } } });
            }

            // Discipuladores in these redes
            if (discipuladoIdsFromRedes.length > 0) {
                hierarchyConditions.push({ discipulados: { some: { id: { in: discipuladoIdsFromRedes } } } });
            }

            // Pastores de rede themselves
            hierarchyConditions.push({ redes: { some: { id: { in: redeIds } } } });
        }

        // 4. Members and leaders in congregações led by requesting user
        const congregacaoIds = [
            ...requestingMember.congregacoesPastorGoverno.map(c => c.id),
            ...requestingMember.congregacoesVicePresidente.map(c => c.id)
        ];

        if (congregacaoIds.length > 0) {
            // All members under this congregação (through rede -> discipulado -> celula)
            hierarchyConditions.push({
                celula: {
                    discipulado: {
                        rede: {
                            congregacaoId: { in: congregacaoIds }
                        }
                    }
                }
            });

            // All leaders at various levels in this congregação
            hierarchyConditions.push({ congregacoesPastorGoverno: { some: { id: { in: congregacaoIds } } } });
            hierarchyConditions.push({ congregacoesVicePresidente: { some: { id: { in: congregacaoIds } } } });
            hierarchyConditions.push({ redes: { some: { congregacaoId: { in: congregacaoIds } } } });
            hierarchyConditions.push({
                discipulados: {
                    some: {
                        rede: {
                            congregacaoId: { in: congregacaoIds }
                        }
                    }
                }
            });
            hierarchyConditions.push({
                ledCelulas: {
                    some: {
                        discipulado: {
                            rede: {
                                congregacaoId: { in: congregacaoIds }
                            }
                        }
                    }
                }
            });
            hierarchyConditions.push({
                leadingInTrainingCelulas: {
                    some: {
                        celula: {
                            discipulado: {
                                rede: {
                                    congregacaoId: { in: congregacaoIds }
                                }
                            }
                        }
                    }
                }
            });
        }

        return hierarchyConditions;
    }

    public async findById(memberId: number) {
        const userInfo = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                celula: true,
                roles: {
                    include: { role: true }
                },
                socialMedia: true
            },
            omit: { password: true }
        });

        // replace photoUrl with full CloudFront URL if it exists
        return this.cloudFrontService.transformPhotoUrl(userInfo);
    }

    public async create(body: MemberData.MemberInput, matrixId: number, requestingMemberId?: number, photo?: File) {
        // Validar que se hasSystemAccess é true, email é obrigatório
        if (body.hasSystemAccess && (!body.email || !body.email.trim())) {
            throw new HttpException('Email é obrigatório para membros com acesso ao sistema', HttpStatus.BAD_REQUEST);
        }

        if (body.email) {
            const existingEmailMember = await this.prisma.member.findFirst({
                where: {
                    email: body.email
                }
            });
            if (existingEmailMember) {
                throw new HttpException('Email já está em uso por outro membro', HttpStatus.BAD_REQUEST);
            }
        }

        // Validate that celulaId belongs to the same matrix if provided
        if (body.celulaId && matrixId) {
            const celula = await this.prisma.celula.findUnique({
                where: { id: body.celulaId },
                select: { matrixId: true }
            });

            if (!celula) {
                throw new HttpException('Célula não encontrada', HttpStatus.NOT_FOUND);
            }

            if (celula.matrixId !== matrixId) {
                throw new HttpException('Célula pertence a outra matriz', HttpStatus.FORBIDDEN);
            }
        }

        // Validate that ministryPositionId belongs to the same matrix
        if (body.ministryPositionId && matrixId) {
            const ministry = await this.prisma.ministry.findUnique({
                where: { id: body.ministryPositionId },
                select: { matrixId: true }
            });

            if (!ministry) {
                throw new HttpException('Cargo ministerial não encontrado', HttpStatus.NOT_FOUND);
            }

            if (ministry.matrixId !== matrixId) {
                throw new HttpException('Cargo ministerial pertence a outra matriz', HttpStatus.FORBIDDEN);
            }
        }

        // Validar hierarquia ministerial: usuário só pode criar membros com cargos abaixo do seu
        if (body.ministryPositionId && requestingMemberId) {
            await this.validateMinistryHierarchy(requestingMemberId, body.ministryPositionId);
        }

        // Validar cônjuge se casado
        if (body.maritalStatus === 'MARRIED' && body.spouseId) {
            await this.validateAndUpdateSpouse(body.spouseId, null);
        }

        const { roleIds, ...memberData } = body;

        // Se hasSystemAccess é true e não foi fornecida senha, definir senha padrão
        if (memberData.hasSystemAccess && !memberData.password) {
            const defaultPassword = '123456';
            memberData.password = await bcrypt.hash(defaultPassword, this.securityConfig.bcryptSaltRounds);
            memberData.hasDefaultPassword = true;
        }

        const matrixInfo = await this.matrixService.findById(matrixId);

        const fileName = photo ? `${matrixInfo.name}/members/${Date.now()}_${photo.originalname}` : null;

        if (photo && fileName) {
            const fileBuffer = await sharp(photo.buffer)
                .resize({ height: 1080, width: 1080, fit: "contain" })
                .toBuffer();

            await this.awsService.uploadFile(fileBuffer, fileName, photo.mimetype);
        }

        // Converter strings vazias em null para datas e garantir formato ISO-8601 completo
        const data: PrismaModels.MemberUncheckedCreateInput = {
            ...memberData,
            baptismDate: cleanDateField(memberData.baptismDate),
            birthDate: cleanDateField(memberData.birthDate),
            registerDate: cleanDateField(memberData.registerDate),
            phone: cleanPhoneField(memberData.phone),
            streetNumber: cleanStringField(memberData.streetNumber),
            zipCode: cleanStringField(memberData.zipCode),
            photoUrl: fileName,
        } as PrismaModels.MemberUncheckedCreateInput;

        // Validar que apenas admins podem atribuir roles admin
        if (roleIds && roleIds.length > 0 && requestingMemberId) {
            const rolesBeingAssigned = await this.prisma.role.findMany({
                where: { id: { in: roleIds } }
            });

            const hasAdminRole = rolesBeingAssigned.some(r => r.isAdmin);

            if (hasAdminRole) {
                const requestingPermission = await this.permissionService.loadPermissionForMember(requestingMemberId);
                if (!requestingPermission || !requestingPermission.isAdmin) {
                    throw new HttpException('Apenas administradores podem atribuir roles de administrador', HttpStatus.UNAUTHORIZED);
                }
            }
        }

        try {
            const member = await this.prisma.member.create({ data });

            // Criar associação MemberMatrix se matrixId fornecido
            if (matrixId) {
                await this.prisma.memberMatrix.create({
                    data: {
                        memberId: member.id,
                        matrixId
                    }
                });
            }

            // Criar associações de roles se fornecidas
            if (roleIds && roleIds.length > 0) {
                await this.prisma.memberRole.createMany({
                    data: roleIds.map(roleId => ({
                        memberId: member.id,
                        roleId
                    }))
                });
            }

            // Atualizar cônjuge se casado
            if (body.maritalStatus === 'MARRIED' && body.spouseId) {
                await this.updateSpouseMaritalStatus(body.spouseId, member.id);
            }

            // Upsert social media if provided
            if (body.socialMedia && body.socialMedia.length > 0) {
                await this.upsertSocialMedia(member.id, body.socialMedia, cleanPhoneField(body.phone) || undefined);
            } else if (body.phone) {
                // If only phone is provided (no social media), auto-fill WhatsApp
                await this.upsertSocialMedia(member.id, undefined, cleanPhoneField(body.phone) || undefined);
            }

            return await this.prisma.member.findUnique({
                where: { id: member.id },
                include: {
                    roles: { include: { role: true } },
                    celula: true,
                    socialMedia: true
                }
            });
        } catch (error) {
            throw new HttpException(`Falha ao criar membro ${error.message}`, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async update(memberId: number, data: MemberData.MemberInput, matrixId: number, requestingMemberId?: number, photo?: File, deletePhoto?: string) {
        try {
            const currentMember = await this.prisma.member.findUnique({ where: { id: memberId } });

            if (!currentMember) {
                throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND)
            }

            // Validar que se hasSystemAccess é true, email é obrigatório
            if (data.hasSystemAccess) {
                const finalEmail = data.email !== undefined ? data.email : currentMember.email;

                if (!finalEmail || !finalEmail.trim()) {
                    throw new HttpException('Email é obrigatório para membros com acesso ao sistema', HttpStatus.BAD_REQUEST);
                }
            }

            // Validate that celulaId belongs to the same matrix if provided
            if (data.celulaId !== undefined && data.celulaId !== null && matrixId) {
                const celula = await this.prisma.celula.findUnique({
                    where: { id: data.celulaId },
                    select: { matrixId: true }
                });

                if (!celula) {
                    throw new HttpException('Célula não encontrada', HttpStatus.NOT_FOUND);
                }

                if (celula.matrixId !== matrixId) {
                    throw new HttpException('Célula pertence a outra matriz', HttpStatus.FORBIDDEN);
                }
            }

            // Validate that ministryPositionId belongs to the same matrix
            if (data.ministryPositionId !== undefined && matrixId) {
                const ministry = await this.prisma.ministry.findUnique({
                    where: { id: data.ministryPositionId },
                    select: { matrixId: true }
                });

                if (!ministry) {
                    throw new HttpException('Cargo ministerial não encontrado', HttpStatus.NOT_FOUND);
                }

                if (ministry.matrixId !== matrixId) {
                    throw new HttpException('Cargo ministerial pertence a outra matriz', HttpStatus.FORBIDDEN);
                }
            }

            // Validar hierarquia ministerial: usuário só pode atualizar cargos para níveis abaixo do seu
            if (data.ministryPositionId !== undefined && requestingMemberId) {
                await this.validateMinistryHierarchy(requestingMemberId, data.ministryPositionId);
            }

            // Se está ativando hasSystemAccess e não tinha senha, definir senha padrão
            const wasAccessEnabled = currentMember.hasSystemAccess;
            const isEnablingAccess = data.hasSystemAccess && !wasAccessEnabled;
            let updatedData = { ...data };
            if (isEnablingAccess && !currentMember.password) {
                const defaultPassword = '123456';
                updatedData = { ...updatedData, password: await bcrypt.hash(defaultPassword, this.securityConfig.bcryptSaltRounds), hasDefaultPassword: true };
            }

            // Validar cônjuge se casado
            if (updatedData.maritalStatus === 'MARRIED' && updatedData.spouseId) {
                await this.validateAndUpdateSpouse(updatedData.spouseId, memberId);
            }

            const { roleIds, socialMedia, ...memberData } = updatedData;

            // Handle photo upload and deletion
            let newPhotoUrl = currentMember.photoUrl;
            if (photo || deletePhoto == "true") {
                const matrixInfo = await this.matrixService.findById(matrixId);

                // Delete old photo if exists
                if (currentMember.photoUrl) {
                    try {
                        await this.awsService.deleteFile(currentMember.photoUrl);
                        newPhotoUrl = null;
                    } catch (error) {
                        console.error('Error deleting old photo:', error);
                        // Continue even if deletion fails
                    }
                }

                if (photo) {
                    const fileName = `${matrixInfo.name}/members/${Date.now()}_${photo.originalname}`;
                    // Upload new photo
                    const fileBuffer = await sharp(photo.buffer)
                        .resize({ height: 1080, width: 1080, fit: "contain" })
                        .toBuffer();

                    await this.awsService.uploadFile(fileBuffer, fileName, photo.mimetype);
                    newPhotoUrl = fileName;
                }
            }

            // Converter strings vazias em null para datas e garantir formato ISO-8601 completo
            const cleanedMemberData = {
                ...memberData,
                baptismDate: cleanDateField(memberData.baptismDate),
                birthDate: cleanDateField(memberData.birthDate),
                registerDate: cleanDateField(memberData.registerDate),
                phone: cleanPhoneField(memberData.phone),
                streetNumber: cleanStringField(memberData.streetNumber),
                zipCode: cleanStringField(memberData.zipCode),
                ...(newPhotoUrl !== undefined && { photoUrl: newPhotoUrl })
            } as PrismaModels.MemberUncheckedUpdateInput;

            // Validar que apenas admins podem atribuir/remover roles admin
            if (roleIds !== undefined && requestingMemberId) {
                // Verificar roles atuais do membro sendo editado
                const currentMemberRoles = await this.prisma.memberRole.findMany({
                    where: { memberId },
                    include: { role: true }
                });
                const currentHasAdminRole = currentMemberRoles.some(mr => mr.role.isAdmin);

                // Verificar roles sendo atribuídas
                const rolesBeingAssigned = roleIds.length > 0
                    ? await this.prisma.role.findMany({ where: { id: { in: roleIds } } })
                    : [];
                const newHasAdminRole = rolesBeingAssigned.some(r => r.isAdmin);

                // Verificar se o usuário solicitante é admin
                const requestingPermission = await this.permissionService.loadPermissionForMember(requestingMemberId);
                const isRequestingUserAdmin = requestingPermission && requestingPermission.isAdmin;

                // Se membro já tem role admin e está tentando remover, apenas admins podem fazer isso
                if (currentHasAdminRole && !newHasAdminRole && !isRequestingUserAdmin) {
                    throw new HttpException('Apenas administradores podem remover roles de administrador', HttpStatus.UNAUTHORIZED);
                }

                // Se está tentando adicionar role admin, apenas admins podem fazer isso
                if (newHasAdminRole && !currentHasAdminRole && !isRequestingUserAdmin) {
                    throw new HttpException('Apenas administradores podem atribuir roles de administrador', HttpStatus.UNAUTHORIZED);
                }
            }

            await this.prisma.member.update({
                where: { id: memberId },
                data: cleanedMemberData
            });

            // Atualizar roles se fornecidas
            if (roleIds !== undefined) {
                // Remover todas as roles existentes
                await this.prisma.memberRole.deleteMany({
                    where: { memberId }
                });

                // Criar novas associações de roles
                if (roleIds.length > 0) {
                    await this.prisma.memberRole.createMany({
                        data: roleIds.map(roleId => ({
                            memberId,
                            roleId
                        }))
                    });
                }
            }

            // Atualizar cônjuge se casado
            if (data.maritalStatus === 'MARRIED' && data.spouseId) {
                await this.updateSpouseMaritalStatus(data.spouseId, memberId);
            }

            // Upsert social media if provided
            const phoneUpdated = data.phone !== undefined && cleanPhoneField(data.phone) !== null;
            const hadNoPhoneBefore = !currentMember?.phone;

            if (data.socialMedia && data.socialMedia.length > 0) {
                // Auto-fill WhatsApp only if phone is being added for the first time
                const autoFillPhone = (phoneUpdated && hadNoPhoneBefore) ? (cleanPhoneField(data.phone) || undefined) : undefined;
                await this.upsertSocialMedia(memberId, data.socialMedia, autoFillPhone);
            } else if (phoneUpdated && hadNoPhoneBefore) {
                // If only phone is being added (no social media array), auto-fill WhatsApp
                await this.upsertSocialMedia(memberId, undefined, cleanPhoneField(data.phone) || undefined);
            }

            return await this.prisma.member.findUnique({
                where: { id: memberId },
                include: {
                    roles: { include: { role: true } },
                    celula: true,
                    socialMedia: true
                }
            });
        } catch (err) {
            throw new HttpException(`Falha ao atualizar membro: ${err.message}`, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async removeFromCelula(memberId: number) {
        return this.prisma.member.update({
            where: { id: memberId },
            data: { celulaId: null }
        });
    }

    public async getStatistics(filters: MemberData.MemberFilterInput, matrixId: number) {
        const where: PrismaModels.MemberWhereInput = { isActive: true };

        // MANDATORY: Filter by matrixId to prevent cross-matrix access
        if (matrixId) {
            where.matrices = {
                some: {
                    matrixId: matrixId
                }
            };
        }

        if (filters) {

            // Aplicar filtros
            if (filters.celulaId !== undefined) {
                if (filters.celulaId === 0) {
                    where.celulaId = null;
                } else {
                    where.celulaId = Number(filters.celulaId);
                }
            } else {
                const celulaMemberFilter: PrismaModels.CelulaWhereInput = {};
                const celulaLeaderFilter: PrismaModels.CelulaWhereInput = {};
                const discipuladoLeaderFilter: PrismaModels.DiscipuladoWhereInput = {};
                const redeLeaderFilter: PrismaModels.RedeWhereInput = {};
                const congregacaoLeaderFilter: PrismaModels.CongregacaoWhereInput = {};

                // Add matrixId filter to celula if filtering by discipulado, rede or congregacao
                if (matrixId && (filters.discipuladoId || filters.redeId || filters.congregacaoId)) {
                    celulaMemberFilter.matrixId = matrixId;
                    celulaLeaderFilter.matrixId = matrixId;
                }

                // Build nested discipulado filter for celula members
                const discipuladoMemberFilter: any = {};

                if (filters.congregacaoId) {
                    const congregacaoId = Number(filters.congregacaoId);

                    // For members in celulas
                    discipuladoMemberFilter.rede = {
                        congregacaoId: congregacaoId
                    };

                    // For celula leaders
                    celulaLeaderFilter.discipulado = {
                        rede: {
                            congregacaoId: congregacaoId
                        }
                    };

                    // For discipulado leaders
                    discipuladoLeaderFilter.rede = {
                        congregacaoId: congregacaoId
                    };

                    // For rede leaders
                    redeLeaderFilter.congregacaoId = congregacaoId;

                    // For congregacao leaders
                    congregacaoLeaderFilter.id = congregacaoId;
                }

                if (filters.redeId) {
                    const redeId = Number(filters.redeId);

                    // For members in celulas
                    discipuladoMemberFilter.redeId = redeId;

                    // For celula leaders - merge with existing discipulado filter
                    if (celulaLeaderFilter.discipulado) {
                        (celulaLeaderFilter.discipulado as PrismaModels.DiscipuladoWhereInput).redeId = redeId;
                    } else {
                        celulaLeaderFilter.discipulado = {
                            redeId: redeId
                        };
                    }

                    // For discipulado leaders
                    discipuladoLeaderFilter.redeId = redeId;

                    // For rede leaders
                    redeLeaderFilter.id = redeId;
                }

                if (filters.discipuladoId) {
                    const discipuladoId = Number(filters.discipuladoId);

                    // For members in celulas
                    celulaMemberFilter.discipuladoId = discipuladoId;

                    // For celula leaders
                    celulaLeaderFilter.discipuladoId = discipuladoId;

                    // For discipulado leaders
                    discipuladoLeaderFilter.id = discipuladoId;
                }

                // Build OR conditions to include both members and leaders
                const orConditions: PrismaModels.MemberWhereInput[] = [];

                // Members in celulas
                if (Object.keys(discipuladoMemberFilter).length > 0) {
                    celulaMemberFilter.discipulado = discipuladoMemberFilter;
                }
                if (Object.keys(celulaMemberFilter).length > 0) {
                    orConditions.push({ celula: celulaMemberFilter });
                }

                // Leaders of celulas
                if (Object.keys(celulaLeaderFilter).length > 0) {
                    orConditions.push({ ledCelulas: { some: celulaLeaderFilter } });
                    orConditions.push({ leadingInTrainingCelulas: { some: {celula: celulaLeaderFilter} } });
                }

                // Leaders of discipulados
                if (Object.keys(discipuladoLeaderFilter).length > 0) {
                    orConditions.push({ discipulados: { some: discipuladoLeaderFilter } });
                }

                // Leaders of redes
                if (Object.keys(redeLeaderFilter).length > 0) {
                    orConditions.push({ redes: { some: redeLeaderFilter } });
                }

                // Leaders of congregacoes
                if (Object.keys(congregacaoLeaderFilter).length > 0) {
                    orConditions.push({ congregacoesPastorGoverno: { some: congregacaoLeaderFilter } });
                    orConditions.push({ congregacoesVicePresidente: { some: congregacaoLeaderFilter } });
                }

                // Apply OR conditions if we have any
                if (orConditions.length > 0) {
                    where.OR = orConditions;
                }
            }
        }

        const members = await this.prisma.member.findMany({
            where,
            include: { celula: true }
        });

        const total = members.length;
        const withoutCelula = members.filter(m => !m.celulaId).length;

        // Gender statistics
        const genderStats = {
            male: members.filter(m => m.gender === 'MALE').length,
            female: members.filter(m => m.gender === 'FEMALE').length,
            other: members.filter(m => m.gender === 'OTHER').length,
            notInformed: members.filter(m => !m.gender).length,
        };

        // Marital status statistics
        const maritalStatusStats = {
            single: members.filter(m => m.maritalStatus === 'SINGLE').length,
            married: members.filter(m => m.maritalStatus === 'MARRIED').length,
            cohabitating: members.filter(m => m.maritalStatus === 'COHABITATING').length,
            divorced: members.filter(m => m.maritalStatus === 'DIVORCED').length,
            widowed: members.filter(m => m.maritalStatus === 'WIDOWED').length,
            notInformed: members.filter(m => !m.maritalStatus).length,
        };

        // Age range statistics
        const now = new Date();
        const ageRanges = {
            '0-17': 0,
            '18-25': 0,
            '26-35': 0,
            '36-50': 0,
            '51-65': 0,
            '65+': 0,
            notInformed: 0,
        };

        members.forEach(m => {
            if (!m.birthDate) {
                ageRanges.notInformed++;
                return;
            }

            const age = Math.floor((now.getTime() - new Date(m.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

            if (age < 18) ageRanges['0-17']++;
            else if (age <= 25) ageRanges['18-25']++;
            else if (age <= 35) ageRanges['26-35']++;
            else if (age <= 50) ageRanges['36-50']++;
            else if (age <= 65) ageRanges['51-65']++;
            else ageRanges['65+']++;
        });

        return {
            total,
            withoutCelula,
            gender: genderStats,
            maritalStatus: maritalStatusStats,
            ageRanges,
        };
    }

    /**
     * Validar se o cônjuge pode ser associado e atualizar
     */
    private async validateAndUpdateSpouse(spouseId: number, currentMemberId: number | null) {
        const spouse = await this.prisma.member.findUnique({
            where: { id: spouseId }
        });

        if (!spouse) {
            throw new HttpException('Cônjuge não encontrado', HttpStatus.BAD_REQUEST);
        }

        // Verificar se o cônjuge já está casado com outra pessoa
        if (spouse.spouseId && spouse.spouseId !== currentMemberId) {
            throw new HttpException('O cônjuge selecionado já está casado com outro membro', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Atualizar o cônjuge para casado e vincular ao membro atual
     */
    private async updateSpouseMaritalStatus(spouseId: number, memberId: number) {
        await this.prisma.member.update({
            where: { id: spouseId },
            data: {
                maritalStatus: 'MARRIED',
                spouseId: memberId
            }
        });
    }

    /**
     * Send invite email and mark inviteSent as true (método público para chamar via endpoint)
     */
    public async sendInvite(memberId: number, matrixId: number): Promise<MemberData.InviteResponse> {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });

        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (!member.hasSystemAccess) {
            throw new HttpException('Membro não tem acesso ao sistema', HttpStatus.BAD_REQUEST);
        }

        if (!member.email || !member.email.trim()) {
            throw new HttpException('Membro não tem email cadastrado', HttpStatus.BAD_REQUEST);
        }

        const whatsappSent = await this.sendInviteAndMarkSent(memberId, member.email, member.name || 'amado(a)', member.phone, matrixId);

        return {
            success: true,
            message: whatsappSent ? 'Convite enviado no email e WhatsApp' : 'Convite enviado no email',
            whatsappSent
        };
    }

    /**
     * Send invite email and mark inviteSent as true (método privado)
     * Retorna true se WhatsApp foi enviado com sucesso
     */
    private async sendInviteAndMarkSent(memberId: number, email: string, name: string, phone?: string | null, matrixId?: number): Promise<boolean> {
        const frontend = process.env.FRONTEND_URL;
        if (!frontend) {
            throw new HttpException('Frontend URL não configurada', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Get matrix information for personalized invite
        let matrixName = 'Igreja Videira'; // Default fallback
        let matrixDomain = frontend;
        let whatsappApiKey: string | null = null;

        if (matrixId) {
            try {
                const matrix = await this.prisma.matrix.findUnique({
                    where: { id: matrixId },
                    include: { domains: true }
                });

                if (matrix) {
                    matrixName = matrix.name;
                    whatsappApiKey = matrix.whatsappApiKey || null;
                    // Use the first domain if available, otherwise use frontend URL
                    if (matrix.domains && matrix.domains.length > 0) {
                        // Construct full URL with protocol
                        const domain = matrix.domains[0].domain;
                        matrixDomain = domain.startsWith('http') ? domain : `https://${domain}`;
                    }
                }
            } catch (err) {
                // If matrix fetch fails, use defaults
                console.warn(`Failed to fetch matrix ${matrixId}, using defaults`);
            }
        }

        const loginLink = `${matrixDomain}/auth/login`;
        let whatsappSent = false;

        try {
            await this.emailService.sendWelcomeEmail(email, loginLink, name, '123456', matrixName);
            // Marcar como enviado
            await this.prisma.member.update({
                where: { id: memberId },
                data: { inviteSent: true }
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error(`Falha ao enviar email de boas-vindas: ${message}`);
            // Não bloquear o fluxo se o email falhar
        }

        // Enviar WhatsApp se houver telefone
        if (phone && phone.trim()) {
            try {
                const whatsappApiUrl = process.env.WHATSAPP_MANAGER_API;
                if (whatsappApiUrl) {
                    const params = new URLSearchParams({
                        to: phone,
                        name: name,
                        platform: matrixName,
                        platformUrl: matrixDomain,
                        login: email,
                        password: '123456'
                    });

                    const url = `${whatsappApiUrl}/conversations/inviteToChurch?${params.toString()}`;

                    const headers: Record<string, string> = { 'accept': '*/*' };
                    if (whatsappApiKey) {
                        headers['X-API-KEY'] = whatsappApiKey;
                    }

                    await firstValueFrom(
                        this.httpService.post(url, null, { headers })
                    );

                    whatsappSent = true;
                    console.log(`WhatsApp enviado com sucesso para ${phone}`);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erro desconhecido';
                console.error(`Falha ao enviar WhatsApp: ${message}`);
                // Não bloquear o fluxo se o WhatsApp falhar
            }
        }

        return whatsappSent;
    }

    /**
     * Set password using invite token
     */
    public async setPasswordWithToken(token: string, password: string): Promise<MemberData.MemberData> {
        try {
            const payload = jwt.verify(
                token,
                this.securityConfig.jwtSecret,
                { issuer: this.securityConfig.jwtIssuer }
            ) as SetPasswordPayload;
            if (!payload || payload.purpose !== 'set-password') throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
            const userId = payload.userId;
            const hashed = await bcrypt.hash(password, this.securityConfig.bcryptSaltRounds);
            const member = await this.prisma.member.update({ where: { id: userId }, data: { password: hashed, hasDefaultPassword: false } });
            return member;
        } catch (err: unknown) {
            throw new HttpException('Token inválido ou expirado', HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Resend invite email to a member
     */
    public async resendInvite(memberId: number, matrixId: number): Promise<MemberData.InviteResponse> {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });

        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (!member.hasSystemAccess) {
            throw new HttpException('Membro não tem acesso ao sistema', HttpStatus.BAD_REQUEST);
        }

        if (!member.email || !member.email.trim()) {
            throw new HttpException('Membro não tem email cadastrado', HttpStatus.BAD_REQUEST);
        }

        if (member.hasLoggedIn) {
            throw new HttpException('Membro já acessou o sistema', HttpStatus.BAD_REQUEST);
        }

        const whatsappSent = await this.sendInviteAndMarkSent(memberId, member.email, member.name || 'amado(a)', member.phone, matrixId);

        return {
            success: true,
            message: whatsappSent ? 'Convite reenviado no email e WhatsApp' : 'Convite reenviado no email',
            whatsappSent
        };
    }


    /**
     * Authenticate a user and return a JWT token
     *
     * @param data Login credentials
     * @returns JWT token and user data
     */
    public async login(data: MemberData.LoginInput): Promise<MemberData.LoginOutput> {

        const member = await this.prisma.member.findUnique({
            include: {
                leadingInTrainingCelulas: {
                    include: {
                        celula: true
                    }
                },
                ledCelulas: true,
                discipulados: {
                    include: {
                        celulas: true
                    }
                },
                redes: {
                    include: {
                        discipulados: {
                            include: {
                                celulas: true
                            }
                        }
                    }
                },
                congregacoesPastorGoverno: true,
                congregacoesVicePresidente: true,
                matrices: {
                    include: {
                        matrix: {
                            include: {
                                domains: true
                            }
                        }
                    }
                }
            },
            where: { email: data.email }
        });


        if (!member) {
            throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
        }

        // replace photoUrl with cloudfront URL if exists
        this.cloudFrontService.transformPhotoUrl(member);

        const memberWithoutPassword = { ...member, password: undefined };

        // Verificar se o membro tem acesso ao sistema
        if (!member.hasSystemAccess) {
            throw new HttpException('Acesso ao sistema não autorizado', HttpStatus.UNAUTHORIZED);
        }

        if (!member.password) {
            throw new HttpException('Erro no cadastro do usuário, por favor entre em contato com o suporte!', HttpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(data.password, member.password);

        if (!isPasswordValid) {
            throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
        }

        // Buscar matrizes do usuário
        const userMatrices = member.matrices.map(mm => mm.matrix);

        // Se o usuário não tem matrizes associadas
        if (userMatrices.length === 0) {
            throw new HttpException('Usuário não está associado a nenhuma base/matriz', HttpStatus.UNAUTHORIZED);
        }

        // Login com domain específico - se o domain está no banco, usa ele para fazer login direto
        if (data.domain) {
            const matrix = await this.matrixService.findByDomain(data.domain);

            // Se o domínio foi encontrado no banco de dados, usar ele para login direto
            if (matrix) {
                // Verificar se o usuário tem acesso a esta matriz
                const hasAccess = userMatrices.some(m => m.id === matrix.id);
                if (!hasAccess) {
                    throw new HttpException('Usuário não tem acesso a esta base/matriz', HttpStatus.UNAUTHORIZED);
                }

                // Marcar que o usuário fez login pela primeira vez
                if (!member.hasLoggedIn) {
                    await this.prisma.member.update({
                        where: { id: member.id },
                        data: { hasLoggedIn: true }
                    });
                }

                const token = jwt.sign(
                    {
                        userId: member.id,
                        email: member.email,
                        matrixId: matrix.id
                    },
                    this.securityConfig.jwtSecret,
                    {
                        expiresIn: this.securityConfig.jwtExpiresIn as string,
                        issuer: this.securityConfig.jwtIssuer
                    } as jwt.SignOptions
                );

                // Generate refresh token
                let refreshToken: string | undefined;
                if (this.authService) {
                    refreshToken = await this.authService.generateRefreshToken(member.id);
                }

                return {
                    token,
                    refreshToken,
                    member: memberWithoutPassword,
                    permission: await this.permissionService.loadSimplifiedPermissionForMember(member.id),
                    currentMatrix: { id: matrix.id, name: matrix.name },
                    matrices: userMatrices,
                    requireMatrixSelection: false
                };
            }
            // Se o domínio não foi encontrado (localhost, domínio desconhecido, etc), 
            // prosseguir com a lógica normal de verificação de múltiplas matrizes abaixo
        }

        // Login sem domain específico ou domain não encontrado - verificar quantas matrizes o usuário tem
        if (userMatrices.length === 1) {
            // Se só tem uma matriz, logar automaticamente nela
            const matrix = userMatrices[0];

            if (!member.hasLoggedIn) {
                await this.prisma.member.update({
                    where: { id: member.id },
                    data: { hasLoggedIn: true }
                });
            }

            const token = jwt.sign(
                {
                    userId: member.id,
                    email: member.email,
                    matrixId: matrix.id
                },
                this.securityConfig.jwtSecret,
                {
                    expiresIn: this.securityConfig.jwtExpiresIn as string,
                    issuer: this.securityConfig.jwtIssuer
                } as jwt.SignOptions
            );

            let refreshToken: string | undefined;
            if (this.authService) {
                refreshToken = await this.authService.generateRefreshToken(member.id);
            }

            return {
                token,
                refreshToken,
                member: memberWithoutPassword,
                permission: await this.permissionService.loadSimplifiedPermissionForMember(member.id),
                currentMatrix: { id: matrix.id, name: matrix.name },
                matrices: userMatrices,
                requireMatrixSelection: false
            };
        }

        // Se tem múltiplas matrizes, retornar a lista para o usuário escolher
        // Gerar um token temporário só para seleção de matriz
        const tempToken = jwt.sign(
            {
                userId: member.id,
                email: member.email,
                purpose: 'matrix-selection'
            },
            this.securityConfig.jwtSecret,
            {
                expiresIn: '10m', // Token temporário de 10 minutos
                issuer: this.securityConfig.jwtIssuer
            } as jwt.SignOptions
        );

        return {
            token: tempToken,
            member: memberWithoutPassword,
            permission: null,
            matrices: userMatrices,
            requireMatrixSelection: true
        };
    }

    /**
     * Update own password (authenticated user)
     */
    public async updateOwnPassword(memberId: number, currentPassword: string, newPassword: string) {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });
        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        if (!member.password) {
            throw new HttpException('Usuário não tem senha configurada', HttpStatus.BAD_REQUEST);
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, member.password);
        if (!isPasswordValid) {
            throw new HttpException('Senha atual incorreta', HttpStatus.UNAUTHORIZED);
        }

        const hashedPassword = await bcrypt.hash(newPassword, this.securityConfig.bcryptSaltRounds);
        await this.prisma.member.update({
            where: { id: memberId },
            data: { password: hashedPassword, hasDefaultPassword: false }
        });

        return { success: true };
    }

    /**
     * Update own email (authenticated user)
     */
    public async updateOwnEmail(memberId: number, newEmail: string) {
        // Verificar se o email já está em uso
        const existing = await this.prisma.member.findUnique({ where: { email: newEmail } });
        if (existing && existing.id !== memberId) {
            throw new HttpException('Este email já está em uso', HttpStatus.BAD_REQUEST);
        }

        const member = await this.prisma.member.update({
            where: { id: memberId },
            data: { email: newEmail }
        });

        return member;
    }

    /**
     * Update own profile (authenticated user) - Only personal and address fields
     */
    public async updateOwnProfile(memberId: number, data: MemberData.UpdateOwnProfileInput, photo?: File, deletePhoto?: boolean) {
        // Get current member data to check if phone is being added
        const currentMember = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                matrices: {
                    include: {
                        matrix: true
                    }
                }
            }
        });

        if (!currentMember) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        // Handle photo upload and deletion
        let newPhotoUrl: string | null | undefined = currentMember.photoUrl;
        if (photo || deletePhoto) {
            // Get matrix info for photo folder
            const matrixId = currentMember?.matrices?.[0]?.matrixId;
            if (!matrixId) {
                throw new HttpException('Matrix ID não encontrado', HttpStatus.BAD_REQUEST);
            }

            const matrixInfo = await this.matrixService.findById(matrixId);

            // Delete old photo if exists
            if (currentMember.photoUrl) {
                try {
                    await this.awsService.deleteFile(currentMember.photoUrl);
                    newPhotoUrl = null;
                } catch (error) {
                    console.error('Error deleting old photo:', error);
                    // Continue even if deletion fails
                }
            }

            if (photo) {
                const fileName = `${matrixInfo.name}/members/${Date.now()}_${photo.originalname}`;
                // Upload new photo
                const fileBuffer = await sharp(photo.buffer)
                    .resize({ height: 1080, width: 1080, fit: "contain" })
                    .toBuffer();

                await this.awsService.uploadFile(fileBuffer, fileName, photo.mimetype);
                newPhotoUrl = fileName;
            }
        }

        // Extract social media data
        const { socialMedia, ...memberData } = data;

        // Remove undefined values and add photo URL if changed
        const updateData = {
            ...Object.fromEntries(
                Object.entries(memberData).filter(([_, v]) => v !== undefined)
            ),
            ...(newPhotoUrl !== undefined && { photoUrl: newPhotoUrl })
        };

        // Converter strings vazias em null para datas e garantir formato ISO-8601 completo
        const cleanedMemberData = {
            ...updateData,
            birthDate: cleanDateField(memberData.birthDate),
            phone: cleanPhoneField(memberData.phone),
            streetNumber: cleanStringField(memberData.streetNumber),
            zipCode: cleanStringField(memberData.zipCode),
            ...(newPhotoUrl !== undefined && { photoUrl: newPhotoUrl })
        } as PrismaModels.MemberUncheckedUpdateInput;

        // Update member
        await this.prisma.member.update({
            where: { id: memberId },
            data: cleanedMemberData,
            include: {
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                discipulador: true,
                                rede: {
                                    include: {
                                        congregacao: true
                                    }
                                }
                            }
                        }
                    }
                },
                spouse: true,
                ministryPosition: true,
                winnerPath: true,
                roles: {
                    include: {
                        role: true
                    }
                },
                socialMedia: true
            },
            omit: { password: true }
        });

        // Upsert social media if provided
        const phoneUpdated = data.phone !== undefined && cleanPhoneField(data.phone) !== null;
        const hadNoPhoneBefore = !currentMember?.phone;

        if (socialMedia && socialMedia.length > 0) {
            // Auto-fill WhatsApp only if phone is being added for the first time
            const autoFillPhone = (phoneUpdated && hadNoPhoneBefore) ? (cleanPhoneField(data.phone) || undefined) : undefined;
            await this.upsertSocialMedia(memberId, socialMedia, autoFillPhone);
        } else if (phoneUpdated && hadNoPhoneBefore) {
            // If only phone is being added (no social media array), auto-fill WhatsApp
            await this.upsertSocialMedia(memberId, undefined, cleanPhoneField(data.phone) || undefined);
        }

        // Fetch updated member with social media
        const updatedMember = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                discipulador: true,
                                rede: {
                                    include: {
                                        congregacao: true
                                    }
                                }
                            }
                        }
                    }
                },
                spouse: true,
                ministryPosition: true,
                winnerPath: true,
                roles: {
                    include: {
                        role: true
                    }
                },
                socialMedia: true
            },
            omit: { password: true }
        });

        // replace photoUrl with full CloudFront URL if it exists
        return this.cloudFrontService.transformPhotoUrl(updatedMember);
    }

    /**
     * Get own profile (authenticated user)
     */
    public async getOwnProfile(memberId: number) {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                celula: {
                    include: {
                        discipulado: {
                            include: {
                                discipulador: true,
                                rede: {
                                    include: {
                                        congregacao: true
                                    }
                                }
                            }
                        }
                    }
                },
                spouse: true,
                ministryPosition: true,
                winnerPath: true,
                roles: {
                    include: {
                        role: true
                    }
                },
                socialMedia: true
            },
            omit: { password: true }
        });

        if (!member) {
            throw new HttpException('Membro não encontrado', HttpStatus.NOT_FOUND);
        }

        // replace photoUrl with full CloudFront URL if it exists
        return this.cloudFrontService.transformPhotoUrl(member);
    }

    /**
     * Upsert social media for a member
     * Auto-fills WhatsApp with phone number if phone is provided and WhatsApp is not
     */
    private async upsertSocialMedia(
        memberId: number,
        socialMediaArray?: Array<{ type: string; username: string }>,
        autoFillWhatsAppFromPhone?: string
    ) {
        // Delete all existing social media for this member
        await this.prisma.memberSocialMedia.deleteMany({
            where: { memberId }
        });

        // Start with provided array or empty array
        const finalArray: Array<{ type: string; username: string }> = socialMediaArray ? [...socialMediaArray] : [];

        // Auto-fill WhatsApp if phone is provided and WhatsApp is not in the array
        if (autoFillWhatsAppFromPhone) {
            const hasWhatsApp = finalArray.some(sm => sm.type.toUpperCase() === 'WHATSAPP');
            if (!hasWhatsApp) {
                finalArray.push({ type: 'WHATSAPP', username: autoFillWhatsAppFromPhone });
            }
        }

        // Create all social media entries
        if (finalArray.length > 0) {
            await this.prisma.memberSocialMedia.createMany({
                data: finalArray.map(sm => ({
                    memberId,
                    type: sm.type.toUpperCase(),
                    username: sm.username
                }))
            });
        }
    }

    /**
     * Validates if the requesting user can assign a ministry position
     * based on hierarchy (user can only assign positions below their own)
     * Admins and pastors can assign any position
     */
    private async validateMinistryHierarchy(requestingMemberId: number, targetMinistryPositionId: number) {
        // Carregar permissões do usuário solicitante
        const requestingPermission = await this.permissionService.loadPermissionForMember(requestingMemberId);

        // Admins e pastor presidente podem atribuir qualquer cargo
        if (requestingPermission?.isAdmin ||
            requestingPermission?.ministryType === 'PRESIDENT_PASTOR') {
            return;
        }

        // Se o usuário não tem cargo ministerial, não pode criar membros
        if (!requestingPermission?.ministryPositionId) {
            throw new HttpException('Você não tem permissão para criar membros com cargo ministerial', HttpStatus.UNAUTHORIZED);
        }

        // Buscar os cargos ministeriais
        const [requestingMinistry, targetMinistry] = await Promise.all([
            this.prisma.ministry.findUnique({ where: { id: requestingPermission.ministryPositionId } }),
            this.prisma.ministry.findUnique({ where: { id: targetMinistryPositionId } })
        ]);

        if (!requestingMinistry || !targetMinistry) {
            throw new HttpException('Cargo ministerial não encontrado', HttpStatus.BAD_REQUEST);
        }

        // Validar hierarquia: priority maior = cargo menor
        // O usuário só pode atribuir cargos com priority MAIOR (menor na hierarquia) que o seu
        if (targetMinistry.priority <= requestingMinistry.priority) {
            throw new HttpException(
                'Você só pode criar membros com cargos abaixo do seu na hierarquia ministerial',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    /**
     * List all members with their admin status and basic role info
     */
    public async findAllWithRoles(matrixId: number) {
        // MANDATORY: Filter by matrixId through matrices relation
        const members = await this.prisma.member.findMany({
            where: {
                matrices: {
                    some: {
                        matrixId: matrixId
                    }
                }
            },
            include: {
                ledCelulas: true,
                leadingInTrainingCelulas: {
                    include: {
                        celula: true
                    }
                },
                discipulados: true,
                redes: true,
                roles: {
                    include: { role: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return members.map(u => {
            const isAdmin = u.roles.some(mr => mr.role.isAdmin);
            return {
                member: u,
                isAdmin,
                celulaIds: Array.from(new Set([...(u.ledCelulas || []).map(c => c.id), ...(u.leadingInTrainingCelulas || []).map(c => c.id)])),
                roles: u.roles.map(mr => mr.role)
            };
        });
    }
}
