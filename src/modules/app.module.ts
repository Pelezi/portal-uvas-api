import { Module } from '@nestjs/common';

import { CommonModule } from './common';
import { AuthModule } from './auth/auth.module';
import { CelulaModule } from './celula/celula.module';
import { DiscipuladoModule } from './discipulado/discipulado.module';
import { RedeModule } from './rede/rede.module';
import { MemberModule } from './member/member.module';
import { ReportModule } from './report/report.module';
import { ConfigModule } from './config/config.module';

@Module({
    imports: [
        CommonModule,
        AuthModule,
        CelulaModule,
        DiscipuladoModule,
        RedeModule,
        MemberModule,
        ReportModule,
        ConfigModule,
    ]
})
export class ApplicationModule {}
