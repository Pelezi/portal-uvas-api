import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { DiscipuladoController } from './controller/discipulado.controller';
import { DiscipuladoService } from './service/discipulado.service';

@Module({
    imports: [CommonModule],
    controllers: [DiscipuladoController],
    providers: [DiscipuladoService],
    exports: [DiscipuladoService]
})
export class DiscipuladoModule {}
