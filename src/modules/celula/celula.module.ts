import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { CelulaController } from './controller/celula.controller';
import { CelulaService } from './service/celula.service';

@Module({
    imports: [CommonModule],
    controllers: [CelulaController],
    providers: [CelulaService],
    exports: [CelulaService]
})
export class CelulaModule {}
