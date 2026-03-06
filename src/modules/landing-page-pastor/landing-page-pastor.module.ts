import { Module } from '@nestjs/common';
import { LandingPagePastorController } from './controller/landing-page-pastor.controller';
import { LandingPagePastorService } from './service/landing-page-pastor.service';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule],
  controllers: [LandingPagePastorController],
  providers: [LandingPagePastorService],
  exports: [LandingPagePastorService]
})
export class LandingPagePastorModule {}
