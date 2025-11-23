import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { MemberController } from './controller/member.controller';
import { MemberService } from './service/member.service';

@Module({
    imports: [CommonModule],
    controllers: [MemberController],
    providers: [MemberService],
    exports: [MemberService]
})
export class MemberModule {}
