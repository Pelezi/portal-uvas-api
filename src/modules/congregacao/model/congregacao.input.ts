import { ApiProperty } from '@nestjs/swagger';

export class CongregacaoCreateInput {
    @ApiProperty({ description: 'Nome da congregação', example: 'Congregação Central' })
    public readonly name: string;

    @ApiProperty({ description: 'Member id do pastor de governo', required: true })
    public readonly pastorGovernoMemberId: number;

    @ApiProperty({ description: 'Member id do vice presidente', required: false })
    public readonly vicePresidenteMemberId?: number;

    @ApiProperty({ description: 'Se esta é a congregação principal da cidade', required: false, default: false })
    public readonly isPrincipal?: boolean;

    @ApiProperty({ description: 'CEP', required: false })
    public readonly zipCode?: string;

    @ApiProperty({ description: 'Rua', required: false })
    public readonly street?: string;

    @ApiProperty({ description: 'Número', required: false })
    public readonly streetNumber?: string;

    @ApiProperty({ description: 'Bairro', required: false })
    public readonly neighborhood?: string;

    @ApiProperty({ description: 'Cidade', required: false })
    public readonly city?: string;

    @ApiProperty({ description: 'Complemento', required: false })
    public readonly complement?: string;

    @ApiProperty({ description: 'Estado', required: false })
    public readonly state?: string;

    @ApiProperty({ description: 'País', required: false, default: 'Brasil' })
    public readonly country?: string;

    @ApiProperty({ description: 'Matrix id', required: false })
    public readonly matrixId?: number;
}

export class CongregacaoUpdateInput {
    @ApiProperty({ description: 'Nome da congregação', required: false })
    public readonly name?: string;

    @ApiProperty({ description: 'Member id do pastor de governo', required: false })
    public readonly pastorGovernoMemberId?: number;

    @ApiProperty({ description: 'Member id do vice presidente', required: false })
    public readonly vicePresidenteMemberId?: number;

    @ApiProperty({ description: 'Se esta é a congregação principal da cidade', required: false })
    public readonly isPrincipal?: boolean;

    @ApiProperty({ description: 'CEP', required: false })
    public readonly zipCode?: string;

    @ApiProperty({ description: 'Rua', required: false })
    public readonly street?: string;

    @ApiProperty({ description: 'Número', required: false })
    public readonly streetNumber?: string;

    @ApiProperty({ description: 'Bairro', required: false })
    public readonly neighborhood?: string;

    @ApiProperty({ description: 'Cidade', required: false })
    public readonly city?: string;

    @ApiProperty({ description: 'Complemento', required: false })
    public readonly complement?: string;

    @ApiProperty({ description: 'Estado', required: false })
    public readonly state?: string;

    @ApiProperty({ description: 'País', required: false })
    public readonly country?: string;
}
