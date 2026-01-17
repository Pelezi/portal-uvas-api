import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { MemberModule } from '../member/member.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [CommonModule, MemberModule],
    controllers: [AuthController]
})
export class AuthModule {}
