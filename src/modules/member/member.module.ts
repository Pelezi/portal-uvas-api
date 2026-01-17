import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { ConfigModule } from '../config/config.module';
import { MemberController } from './controller/member.controller';
import { MemberService } from './service/member.service';

@Module({
    imports: [CommonModule, ConfigModule],
    controllers: [MemberController],
    providers: [MemberService],
    exports: [MemberService]
})
export class MemberModule {}
