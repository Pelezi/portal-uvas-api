import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './controller';
import { LogInterceptor } from './flow';
import { configProvider, LoggerService, PrismaService } from './provider';
import { PermissionGuard } from './security/permission.guard';
import { EmailService } from './provider/email.provider';

@Module({
    imports: [
        TerminusModule
    ],
    providers: [
        configProvider,
        LoggerService,
        LogInterceptor,
        PrismaService,
        PermissionGuard,
        EmailService
    ],
    exports: [
        configProvider,
        LoggerService,
        LogInterceptor,
        PrismaService,
        PermissionGuard,
        EmailService
    ],
    controllers: [
        HealthController
    ],
})
export class CommonModule {}
