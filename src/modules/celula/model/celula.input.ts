import { ApiProperty } from '@nestjs/swagger';

export class CelulaCreateInput {
    
    @ApiProperty({ description: 'Celula name', example: 'Célula Central' })
    public readonly name: string;
    
    @ApiProperty({ description: 'Leader user id (user must exist)', example: 5, required: true })
    public readonly leaderUserId: number;
    
    @ApiProperty({ description: 'Discipulado id that this celula belongs to', example: 2, required: true })
    public readonly discipuladoId: number;

    @ApiProperty({ description: 'id de líder em treinamento (vice líder)', example: 8, required: false })
    public readonly viceLeaderUserId?: number;
}

export class CelulaUpdateInput {
    @ApiProperty({ description: 'Celula name', example: 'Célula Nova', required: false })
    public readonly name?: string;
    @ApiProperty({ description: 'Leader user id (user must exist)', example: 6, required: false })
    public readonly leaderUserId?: number;
}

export class CelulaMultiplyInput {
    @ApiProperty({ description: 'IDs dos membros a serem movidos para a nova célula', example: [1, 2, 3] })
    public readonly memberIds: number[];

    @ApiProperty({ description: 'Nome da nova célula', example: 'Célula Norte' })
    public readonly newCelulaName: string;
    
    @ApiProperty({ description: 'Leader user id for the new celula', example: 7, required: true })
    public readonly newLeaderUserId: number;

    @ApiProperty({ description: 'Leader user id for the original celula (for validation)', example: 5, required: true })
    public readonly oldLeaderUserId: number;
}
