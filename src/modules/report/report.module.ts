import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { ReportController } from './controller/report.controller';
import { ReportService } from './service/report.service';

@Module({
    imports: [CommonModule],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService]
})
export class ReportModule {}
