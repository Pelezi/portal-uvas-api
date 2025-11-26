import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { RedeController } from './controller/rede.controller';
import { RedeService } from './service/rede.service';

@Module({
    imports: [CommonModule],
    controllers: [RedeController],
    providers: [RedeService],
    exports: [RedeService]
})
export class RedeModule {}
