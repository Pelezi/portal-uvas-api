import { Module } from '@nestjs/common';
import { AnnouncementController } from './controller/announcement.controller';
import { AnnouncementService } from './service/announcement.service';
import { AwsService } from '../common/provider/aws.provider';
import { MatrixService } from '../matrix/service/matrix.service';
import { CommonModule } from '../common';

@Module({
    imports: [CommonModule],
    controllers: [AnnouncementController],
    providers: [AnnouncementService, AwsService, MatrixService],
    exports: [AnnouncementService]
})
export class AnnouncementModule { }
