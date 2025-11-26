import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../user/service/user.service';
import { LoginInput } from '../user/model';
import { RestrictedGuard } from '../common/security/restricted.guard';
import { PrismaService } from '../common';
import { AuthenticatedRequest } from '../common/types/authenticated-request.interface';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly userService: UserService, private readonly prisma: PrismaService) {}

    @Post('login')
    @ApiOperation({ summary: 'Login de usuário' })
    @ApiBody({ type: LoginInput })
    @ApiResponse({ status: 200, description: 'Retorna token JWT e dados do usuário' })
    public async login(@Body() body: LoginInput) {
        // Use existing UserService.login
        const res = await this.userService.login(body);
        return res;
    }

    @UseGuards(RestrictedGuard)
    @Get('me')
    public async me(@Req() req: AuthenticatedRequest) {
        const userId = req.user!.userId;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        return user;
    }
}
