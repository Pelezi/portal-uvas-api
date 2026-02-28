import { ApiProperty } from '@nestjs/swagger';

export class CelulaCreateInput {
    
    @ApiProperty({ description: 'Celula name', example: 'Célula Central' })
    public readonly name: string;
    
    @ApiProperty({ description: 'Leader member id (member must exist)', example: 5, required: false })
    public readonly leaderMemberId?: number;
    
    @ApiProperty({ description: 'Host member id (member must exist)', example: 6, required: false })
    public readonly hostMemberId?: number;
    
    @ApiProperty({ description: 'Discipulado id that this celula belongs to', example: 2, required: false })
    public readonly discipuladoId?: number;

    @ApiProperty({ description: 'Dia da semana da reunião (0=Domingo, 1=Segunda, ..., 6=Sábado)', example: 3 })
    public readonly weekday: number;

    @ApiProperty({ description: 'Horário da reunião (formato HH:mm)', example: '19:30' })
    public readonly time: string;

    @ApiProperty({ description: 'Data de abertura da célula', example: '2024-01-15', required: false })
    public readonly openingDate?: string;

    @ApiProperty({ description: 'Tem próximo anfitrião', example: false, required: false })
    public readonly hasNextHost?: boolean;

    @ApiProperty({ description: 'Tipo da célula', example: 'YOUNG', enum: ['YOUNG', 'ADULT', 'TEENAGER', 'CHILDISH'], required: false })
    public readonly type?: string;

    @ApiProperty({ description: 'Nível da célula', example: 'MULTIPLICATION', enum: ['EVANGELISM', 'EDIFICATION', 'COMMUNION', 'MULTIPLICATION', 'UNKNOWN'], required: false })
    public readonly level?: string;

    @ApiProperty({ description: 'País da célula', example: 'Brasil', required: false })
    public readonly country?: string;

    @ApiProperty({ description: 'CEP da célula', example: '55020-000', required: false })
    public readonly zipCode?: string;

    @ApiProperty({ description: 'Rua da célula', example: 'Rua das Flores', required: false })
    public readonly street?: string;

    @ApiProperty({ description: 'Número da rua', example: '123', required: false })
    public readonly streetNumber?: string;

    @ApiProperty({ description: 'Bairro da célula', example: 'Centro', required: false })
    public readonly neighborhood?: string;

    @ApiProperty({ description: 'Cidade da célula', example: 'Caruaru', required: false })
    public readonly city?: string;

    @ApiProperty({ description: 'Complemento do endereço', example: 'Apartamento 202', required: false })
    public readonly complement?: string;

    @ApiProperty({ description: 'Estado da célula', example: 'PE', required: false })
    public readonly state?: string;

    @ApiProperty({ description: 'ID da célula paralela', example: 2, required: false })
    public readonly parallelCelulaId?: number;
}

export class CelulaUpdateInput {
    @ApiProperty({ description: 'Celula name', example: 'Célula Nova', required: false })
    public readonly name?: string;
    @ApiProperty({ description: 'Leader member id (member must exist)', example: 6, required: false })
    public readonly leaderMemberId?: number;
    @ApiProperty({ description: 'Host member id (member must exist)', example: 7, required: false })
    public readonly hostMemberId?: number;
    @ApiProperty({ description: 'Discipulado id that this celula belongs to', example: 2, required: false })
    public readonly discipuladoId?: number;
    @ApiProperty({ description: 'IDs dos líderes em treinamento', example: [7, 8], required: false, type: [Number] })
    public readonly leaderInTrainingIds?: number[];
    @ApiProperty({ description: 'Dia da semana da reunião (0=Domingo, 1=Segunda, ..., 6=Sábado)', example: 3, required: false })
    public readonly weekday?: number;
    @ApiProperty({ description: 'Horário da reunião (formato HH:mm)', example: '19:30', required: false })
    public readonly time?: string;
    @ApiProperty({ description: 'Data de abertura da célula', example: '2024-01-15', required: false })
    public readonly openingDate?: string;
    @ApiProperty({ description: 'Tem próximo anfitrião', example: false, required: false })
    public readonly hasNextHost?: boolean;
    @ApiProperty({ description: 'Tipo da célula', example: 'YOUNG', enum: ['YOUNG', 'ADULT', 'TEENAGER', 'CHILDISH'], required: false })
    public readonly type?: string;
    @ApiProperty({ description: 'Nível da célula', example: 'MULTIPLICATION', enum: ['EVANGELISM', 'EDIFICATION', 'COMMUNION', 'MULTIPLICATION', 'UNKNOWN'], required: false })
    public readonly level?: string;
    @ApiProperty({ description: 'País da célula', example: 'Brasil', required: false })
    public readonly country?: string;
    @ApiProperty({ description: 'CEP da célula', example: '55020-000', required: false })
    public readonly zipCode?: string;
    @ApiProperty({ description: 'Rua da célula', example: 'Rua das Flores', required: false })
    public readonly street?: string;
    @ApiProperty({ description: 'Número da rua', example: '123', required: false })
    public readonly streetNumber?: string;
    @ApiProperty({ description: 'Bairro da célula', example: 'Centro', required: false })
    public readonly neighborhood?: string;
    @ApiProperty({ description: 'Cidade da célula', example: 'Caruaru', required: false })
    public readonly city?: string;
    @ApiProperty({ description: 'Complemento do endereço', example: 'Apartamento 202', required: false })
    public readonly complement?: string;
    @ApiProperty({ description: 'Estado da célula', example: 'PE', required: false })
    public readonly state?: string;

    @ApiProperty({ description: 'ID da célula paralela', example: 2, required: false })
    public readonly parallelCelulaId?: number;

    @ApiProperty({ description: 'Marca se a célula está OK', example: true, required: false })
    public readonly isOk?: boolean;
}

export class CelulaMultiplyInput {
    @ApiProperty({ description: 'IDs dos membros a serem movidos para a nova célula', example: [1, 2, 3] })
    public readonly memberIds: number[];

    @ApiProperty({ description: 'Nome da nova célula', example: 'Célula Norte' })
    public readonly newCelulaName: string;
    
    @ApiProperty({ description: 'Leader member id for the new celula', example: 7, required: false })
    public readonly newLeaderMemberId?: number;

    @ApiProperty({ description: 'Leader member id for the original celula (for validation)', example: 5, required: false })
    public readonly oldLeaderMemberId?: number;
}

export class CelulaFilterInput {
    @ApiProperty({ description: 'Nome da célula para filtrar', example: 'Célula Vida', required: false })
    public readonly name?: string;
    
    @ApiProperty({ description: 'ID do líder em treinamento para filtrar as células', example: 8, required: false })
    public readonly leaderInTrainingMemberId?: number;
    
    @ApiProperty({ description: 'ID do líder para filtrar as células', example: 5, required: false })
    public readonly leaderMemberId?: number;
    
    @ApiProperty({ description: 'ID do discipulado para filtrar as células', example: 2, required: false })
    public readonly discipuladoId?: number;

    @ApiProperty({ description: 'ID da rede para filtrar as células', example: 1, required: false })
    public readonly redeId?: number;

    @ApiProperty({ description: 'ID da congregação para filtrar as células', example: 1, required: false })
    public readonly congregacaoId?: number;

    @ApiProperty({ description: 'Todas as células?', example: true, required: false })
    public all?: boolean;

    @ApiProperty({ description: 'IDs das células para filtrar', example: [1, 2, 3], required: false, type: [Number] })
    public celulaIds?: number[];
}