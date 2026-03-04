import { Module } from '@nestjs/common';
import { MagazineController } from './controller/magazine.controller';
import { MagazineService } from './service/magazine.service';
import { AwsService } from '../common/provider/aws.provider';
import { MatrixService } from '../matrix/service/matrix.service';
import { CommonModule } from '../common';

@Module({
    imports: [CommonModule],
    controllers: [MagazineController],
    providers: [MagazineService, AwsService, MatrixService],
    exports: [MagazineService]
})
export class MagazineModule { }
