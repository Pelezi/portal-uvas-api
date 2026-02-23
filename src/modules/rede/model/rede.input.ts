import { ApiProperty } from '@nestjs/swagger';

export class RedeCreateInput {
    @ApiProperty({ description: 'Nome da rede', example: 'Rede Norte' })
    public readonly name: string;

    @ApiProperty({ description: 'Congregação id', required: true })
    public readonly congregacaoId: number;

    @ApiProperty({ description: 'Member id of the pastor for this rede', required: false })
    public readonly pastorMemberId: number;

    @ApiProperty({ description: 'Matrix id', required: false })
    public readonly matrixId?: number;

    @ApiProperty({ description: 'Indica se a rede é do tipo Kids', required: false, example: false })
    public readonly isKids?: boolean;
}

export class RedeFilterInput {
    @ApiProperty({ description: 'Filtro por congregação', required: false, example: 1 })
    public readonly congregacaoId?: number;

    @ApiProperty({ description: 'Filtro por pastor', required: false, example: 2 })
    public readonly pastorMemberId?: number;

    @ApiProperty({ description: 'Filtro por nome da rede', required: false, example: 'Rede Norte' })
    public readonly name?: string;

    @ApiProperty({ description: 'Filtro por tipo de rede (Kids)', required: false, example: true })
    public readonly isKids?: boolean;

    @ApiProperty({ description: 'Filtro por IDs específicos de redes', required: false, example: [1, 2, 3], type: [Number] })
    public redeIds?: number[];

    @ApiProperty({ description: 'Todos as redes', required: false, example: false })
    public readonly all?: boolean;
}