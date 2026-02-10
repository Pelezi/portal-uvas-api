import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { CongregacaoController } from './controller/congregacao.controller';
import { CongregacaoService } from './service/congregacao.service';

@Module({
    imports: [CommonModule],
    controllers: [CongregacaoController],
    providers: [CongregacaoService],
    exports: [CongregacaoService]
})
export class CongregacaoModule {}
