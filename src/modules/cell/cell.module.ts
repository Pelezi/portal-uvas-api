import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { CellController } from './controller/cell.controller';
import { CellService } from './service/cell.service';

@Module({
    imports: [CommonModule],
    controllers: [CellController],
    providers: [CellService],
    exports: [CellService]
})
export class CellModule {}
