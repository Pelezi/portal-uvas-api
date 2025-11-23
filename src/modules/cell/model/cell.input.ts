import { ApiProperty } from '@nestjs/swagger';

export class CellCreateInput {
    @ApiProperty({ description: 'Cell name', example: 'Célula Central' })
    public readonly name: string;
    @ApiProperty({ description: 'Leader user id (user must exist)', example: 5, required: false })
    public readonly leaderUserId?: number;

    @ApiProperty({ description: 'Discipulado id that this cell belongs to', example: 2, required: false })
    public readonly discipuladoId?: number;
}

export class CellUpdateInput {
    @ApiProperty({ description: 'Cell name', example: 'Célula Nova', required: false })
    public readonly name?: string;
    @ApiProperty({ description: 'Leader user id (user must exist)', example: 6, required: false })
    public readonly leaderUserId?: number;
}

export class CellMultiplyInput {
    @ApiProperty({ description: 'IDs dos membros a serem movidos para a nova célula', example: [1, 2, 3] })
    public readonly memberIds: number[];

    @ApiProperty({ description: 'Nome da nova célula', example: 'Célula Norte' })
    public readonly newCellName: string;
    @ApiProperty({ description: 'Leader user id for the new cell', example: 7, required: false })
    public readonly newLeaderUserId?: number;

    @ApiProperty({ description: 'Leader user id for the original cell (for validation)', example: 5, required: false })
    public readonly oldLeaderUserId?: number;
}
