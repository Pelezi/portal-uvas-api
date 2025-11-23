import { Body, Controller, Get, HttpStatus, Post, Patch, Delete, UseGuards, UnauthorizedException, Request, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { RestrictedGuard } from '../../common';
import { PermissionGuard } from '../../common/security/permission.guard';
import { PrismaService } from '../../common/provider/prisma.provider';

import { UserData, UserInput, LoginInput } from '../model';
import { UserService } from '../service';

@Controller('users')
@ApiTags('usuários')
export class UserController {

    public constructor(
        private readonly userService: UserService,
        private readonly prisma: PrismaService
    ) { }

    private ensureManagePermissions(permission: any) {
        if (!permission || !permission.canManagePermissions) throw new Error('No rights');
    }

    @Post('register')
    @ApiOperation({ 
        summary: 'Registrar um novo usuário',
        description: 'Cria uma nova conta de usuário no sistema. Este endpoint permite que novos usuários se registrem fornecendo nome, email e senha. O email deve ser único no sistema. A senha será armazenada de forma segura usando hash bcrypt. Após o registro bem-sucedido, o usuário pode fazer login para obter um token JWT e acessar os recursos protegidos da API.'
    })
    @ApiResponse({ status: HttpStatus.CREATED, type: UserData, description: 'Usuário criado com sucesso' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos ou email já cadastrado' })
    public async register(@Body() input: UserInput): Promise<UserData> {
        return this.userService.create(input);
    }

    @Post('invite')
    @UseGuards(RestrictedGuard, PermissionGuard)
    public async invite(@Request() req: any, @Body() body: { email: string; firstName?: string; lastName?: string; discipuladoId?: number }) {
        const permission = req.permission;

        // if a discipuladoId is provided, ensure the requester can invite for that discipulado
        if (body.discipuladoId) {
            const pd = await this.prisma.permissionDiscipulado.findFirst({ where: { permissionId: permission.id, discipuladoId: body.discipuladoId } });
            if (!pd) {
                // check pastor for that discipulado's network
                const disc = await this.prisma.discipulado.findUnique({ where: { id: body.discipuladoId } });
                if (!disc) throw new Error('Discipulado not found');
                const pn = await this.prisma.permissionNetwork.findFirst({ where: { permissionId: permission.id, networkId: disc.networkId } });
                if (!pn) throw new Error('No rights to invite for this discipulado');
            }
        }

        return this.userService.inviteUser(body.email, body.firstName, body.lastName);
    }

    @Post('set-password')
    public async setPassword(@Body() body: { token: string; password: string }) {
        return this.userService.setPasswordWithToken(body.token, body.password);
    }

    @Post('request-set-password')
    public async requestSetPassword(@Body() body: { email: string }) {
        return this.userService.requestSetPassword(body.email);
    }

    @Post('login')
    @ApiOperation({ 
        summary: 'Autenticar usuário e obter token JWT',
        description: 'Realiza a autenticação do usuário no sistema usando email e senha. Quando bem-sucedido, retorna um token JWT que deve ser usado no cabeçalho Authorization (Bearer token) para acessar endpoints protegidos da API. O token contém informações do usuário codificadas e tem validade configurável. Este é o ponto de entrada para todas as operações autenticadas na API.'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Login realizado com sucesso, retorna token JWT, dados do usuário e permissões' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciais inválidas - email ou senha incorretos' })
    public async login(@Body() input: LoginInput): Promise<any> {
        try {
            return await this.userService.login(input);
        } catch (error) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
    }

    @Get('me')
    @UseGuards(RestrictedGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retorna os dados do usuário autenticado e suas permissões (sem token)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Dados do usuário autenticado e permissões' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token JWT ausente ou inválido' })
    public async me(@Request() req: any): Promise<{ user: UserData; permission?: { id: number; hasGlobalCellAccess: boolean; canManageCells: boolean; canManagePermissions: boolean; cellIds: number[] | null } | null }> {
        const userId = req.user.userId;
        return this.userService.me(userId);
    }

    @Get()
    @UseGuards(RestrictedGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Listar todos os usuários',
        description: 'Retorna a lista completa de todos os usuários cadastrados no sistema. Este endpoint requer autenticação via token JWT no cabeçalho Authorization. Útil para administradores que precisam visualizar todos os usuários da plataforma. Os dados retornados incluem informações básicas de cada usuário, mas excluem dados sensíveis como senhas.'
    })
    @ApiResponse({ status: HttpStatus.OK, isArray: true, type: UserData, description: 'Lista de usuários retornada com sucesso' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token JWT ausente ou inválido' })
    public async find(): Promise<UserData[]> {
        return this.userService.find();
    }

    @Post('setup')
    @UseGuards(RestrictedGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Completar configuração inicial do usuário',
        description: 'Configura as categorias padrão do usuário e marca a primeira configuração como concluída. Recebe uma lista de categorias selecionadas com suas subcategorias e cria-as no banco de dados.'
    })
    @ApiResponse({ status: HttpStatus.OK, type: UserData, description: 'Configuração concluída com sucesso' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token JWT ausente ou inválido' })
    public async completeSetup(
        @Request() req: any,
        @Body() body: { categories: Array<{ name: string; type: 'EXPENSE' | 'INCOME'; subcategories: string[] }> }
    ): Promise<UserData> {
        const userId = req.user.userId;
                
        // Mark first access as complete
        return this.userService.completeFirstAccess(userId);
    }

    @Patch('profile')
    @UseGuards(RestrictedGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Atualizar perfil do usuário',
        description: 'Atualiza as informações do perfil do usuário, incluindo timezone.'
    })
    @ApiResponse({ status: HttpStatus.OK, type: UserData, description: 'Perfil atualizado com sucesso' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token JWT ausente ou inválido' })
    public async updateProfile(
        @Request() req: any,
        @Body() body: { timezone?: string }
    ): Promise<UserData> {
        const userId = req.user.userId;
        return this.userService.updateProfile(userId, body);
    }

    @Patch(':id')
    @UseGuards(RestrictedGuard, PermissionGuard)
    @ApiBearerAuth()
    public async updateUser(@Request() req: any, @Param('id') id: string, @Body() body: { firstName?: string; lastName?: string; phoneNumber?: string; timezone?: string }) {
        const permission = (req as any).permission;
        this.ensureManagePermissions(permission);
        const userId = parseInt(id || '0', 10);
        if (!userId) throw new Error('Invalid user id');
        return this.userService.updateUser(userId, body);
    }

    @Delete(':id')
    @UseGuards(RestrictedGuard, PermissionGuard)
    @ApiBearerAuth()
    public async deleteUser(@Request() req: any, @Param('id') id: string) {
        const permission = (req as any).permission;
        this.ensureManagePermissions(permission);
        const userId = parseInt(id || '0', 10);
        if (!userId) throw new Error('Invalid user id');
        return this.userService.deleteUser(userId);
    }

    @Get(':id')
    @UseGuards(RestrictedGuard, PermissionGuard)
    @ApiBearerAuth()
    public async getUserById(@Request() req: any, @Param('id') id: string) {
        const permission = (req as any).permission;
        this.ensureManagePermissions(permission);
        const userId = parseInt(id || '0', 10);
        if (!userId) throw new Error('Invalid user id');
        return this.userService.getByIdWithPermission(userId);
    }

    @Get('search')
    @UseGuards(RestrictedGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Pesquisar usuários por email ou nome',
        description: 'Pesquisa usuários pelo email ou nome. Retorna até 10 usuários que correspondem ao termo de pesquisa. Útil para funcionalidade de autocomplete ao convidar membros para grupos.'
    })
    @ApiQuery({ name: 'query', required: true, description: 'Termo de pesquisa para o email ou nome do usuário' })
    @ApiResponse({ status: HttpStatus.OK, isArray: true, type: UserData, description: 'Lista de usuários encontrados' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token JWT ausente ou inválido' })
    public async searchUsers(@Query('q') query: string): Promise<UserData[]> {
        return this.userService.searchByEmailOrName(query);
    }

}
