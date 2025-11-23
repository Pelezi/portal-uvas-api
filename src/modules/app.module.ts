import { Module } from '@nestjs/common';

import { CommonModule } from './common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CellModule } from './cell/cell.module';
import { MemberModule } from './member/member.module';
import { ReportModule } from './report/report.module';
import { PermissionModule } from './permission/permission.module';

@Module({
    imports: [
        CommonModule,
        AuthModule,
        CellModule,
        MemberModule,
        ReportModule,
        PermissionModule,
        UserModule
    ]
})
export class ApplicationModule {}
