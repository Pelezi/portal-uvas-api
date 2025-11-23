import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { PermissionController } from './controller/permission.controller';
import { PermissionService } from './service/permission.service';

@Module({
    imports: [CommonModule],
    controllers: [PermissionController],
    providers: [PermissionService],
    exports: [PermissionService]
})
export class PermissionModule {}
