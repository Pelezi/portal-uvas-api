import { ApiProperty } from '@nestjs/swagger';

export class CongregacaoCreateInput {
    @ApiProperty({ description: 'Nome da congregação', example: 'Congregação Central' })
    public readonly name: string;

    @ApiProperty({ description: 'Member id do pastor de governo', required: true })
    public readonly pastorGovernoMemberId: number;

    @ApiProperty({ description: 'Member id do vice presidente', required: false })
    public readonly vicePresidenteMemberId?: number;

    @ApiProperty({ description: 'Member id da responsável pela rede kids', required: false })
    public readonly kidsLeaderMemberId?: number;

    @ApiProperty({ description: 'Se esta é a congregação principal da cidade', required: false, default: false })
    public readonly isPrincipal?: boolean;

    @ApiProperty({ description: 'Instagram da congregação', required: false })
    public readonly instagram?: string;

    @ApiProperty({ description: 'WhatsApp do responsável pela congregação', required: false })
    public readonly whatsappResponsavel?: string;

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

    @ApiProperty({ description: 'Latitude da localização', example: -8.2838, required: false })
    public readonly latitude?: number;

    @ApiProperty({ description: 'Longitude da localização', example: -35.9741, required: false })
    public readonly longitude?: number;

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

    @ApiProperty({ description: 'Member id da responsável pela rede kids', required: false })
    public readonly kidsLeaderMemberId?: number;

    @ApiProperty({ description: 'Se esta é a congregação principal da cidade', required: false })
    public readonly isPrincipal?: boolean;

    @ApiProperty({ description: 'Instagram da congregação', required: false })
    public readonly instagram?: string;

    @ApiProperty({ description: 'WhatsApp do responsável pela congregação', required: false })
    public readonly whatsappResponsavel?: string;

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

    @ApiProperty({ description: 'Latitude da localização', example: -8.2838, required: false })
    public readonly latitude?: number;

    @ApiProperty({ description: 'Longitude da localização', example: -35.9741, required: false })
    public readonly longitude?: number;
}

export class CongregacaoFilterInput {
    @ApiProperty({ description: 'Filtro por nome da congregação', required: false, example: 'Central' })
    public readonly name?: string;

    @ApiProperty({ description: 'Filtro por pastor de governo', required: false, example: 1 })
    public readonly pastorGovernoMemberId?: number;

    @ApiProperty({ description: 'Filtro por vice presidente', required: false, example: 2 })
    public readonly vicePresidenteMemberId?: number;

    @ApiProperty({ description: 'Filtro por IDs específicos de congregações', required: false, example: [1, 2, 3], type: [Number] })
    public congregacaoIds?: number[];

    @ApiProperty({ description: 'Todas as congregações', required: false, example: false })
    public readonly all?: boolean;
}
