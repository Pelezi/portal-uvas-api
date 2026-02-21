import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './controller';
import { LogInterceptor } from './flow';
import { configProvider, LoggerService, PrismaService, CloudFrontService } from './provider';
import { PermissionGuard } from './security/permission.guard';
import { PermissionService } from './security/permission.service';
import { ApiKeyGuard } from './security/api-key.guard';
import { EmailService } from './provider/email.provider';
import { AwsService } from './provider/aws.provider';

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
        PermissionService,
        ApiKeyGuard,
        EmailService,
        AwsService,
        CloudFrontService
    ],
    exports: [
        configProvider,
        LoggerService,
        LogInterceptor,
        PrismaService,
        PermissionGuard,
        PermissionService,
        ApiKeyGuard,
        EmailService,
        CloudFrontService,
        AwsService
    ],
    controllers: [
        HealthController
    ],
})
export class CommonModule {}
