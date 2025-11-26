import { Module } from '@nestjs/common';

import { CommonModule } from './common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CelulaModule } from './celula/celula.module';
import { DiscipuladoModule } from './discipulado/discipulado.module';
import { RedeModule } from './rede/rede.module';
import { MemberModule } from './member/member.module';
import { ReportModule } from './report/report.module';
import { PermissionModule } from './permission/permission.module';

@Module({
    imports: [
        CommonModule,
        AuthModule,
        CelulaModule,
        DiscipuladoModule,
        RedeModule,
        MemberModule,
        ReportModule,
        PermissionModule,
        UserModule
    ]
})
export class ApplicationModule {}
