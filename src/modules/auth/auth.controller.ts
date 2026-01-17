import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MemberService } from '../member/service/member.service';
import { LoginInput } from '../member/model';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(
        private readonly memberService: MemberService, 
    ) {}

    @Post('login')
    @ApiOperation({ summary: 'Login de usuário' })
    @ApiBody({ type: LoginInput })
    @ApiResponse({ status: 200, description: 'Retorna token JWT e dados do usuário' })
    public async login(@Body() body: LoginInput) {
        const res = await this.memberService.login(body);
        return res;
    }
}
