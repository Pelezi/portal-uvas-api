import { ApiProperty } from '@nestjs/swagger';

export class DiscipuladoCreateInput {
    @ApiProperty({ description: 'Nome do discipulado', example: 'Discipulado Norte' })
    public readonly name: string;

    @ApiProperty({ description: 'Rede (network) id this discipulado belongs to', example: 1 })
    public readonly redeId: number;

    @ApiProperty({ description: 'User id of discipulador', required: true, example: 2 })
    public readonly discipuladorMemberId: number;

    @ApiProperty({ description: 'Matrix id', required: false })
    public readonly matrixId?: number;
}

export class DiscipuladoFilterInput {
    @ApiProperty({ description: 'Filtro por congregação', required: false, example: 1 })
    public readonly congregacaoId?: number;
    
    @ApiProperty({ description: 'Filtro por rede', required: false, example: 1 })
    public readonly redeId?: number;

    @ApiProperty({ description: 'Filtro por discipulador', required: false, example: 2 })
    public readonly discipuladorMemberId?: number;

    @ApiProperty({ description: 'Filtro por IDs específicos de discipulados', required: false, example: [1, 2, 3], type: [Number] })
    public discipuladoIds?: number[];

    @ApiProperty({ description: 'Todos os discipulados', required: false, example: false })
    public readonly all?: boolean;
}