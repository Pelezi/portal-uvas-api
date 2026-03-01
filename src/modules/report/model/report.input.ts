import { ApiProperty } from '@nestjs/swagger';

export class ReportCreateInput {
    @ApiProperty({ description: 'Array of member IDs to include in the report', example: [1, 2, 3] })
    public readonly memberIds: number[];
    @ApiProperty({ description: 'Optional date for the report (yyyy-mm-dd)', example: '2025-11-25', required: false })
    public readonly date?: string;
    @ApiProperty({ description: 'Report type: CELULA or CULTO', example: 'CELULA', enum: ['CELULA', 'CULTO'], default: 'CELULA', required: false })
    public readonly type?: 'CELULA' | 'CULTO';
    @ApiProperty({ description: 'Offer amount for the report (only for CELULA type)', example: 150.50, required: false })
    public readonly offerAmount?: number;
}

export class ReportFilterInput {
    @ApiProperty({ description: 'Id da célula', example: 1, required: false })
    public readonly celulaId?: number;

    @ApiProperty({ description: 'Id do discipulado', example: 1, required: false })
    public readonly discipuladoId?: number;

    @ApiProperty({ description: 'Id da rede', example: 1, required: false })
    public readonly redeId?: number;

    @ApiProperty({ description: 'Id da congregação', example: 1, required: false })
    public readonly congregacaoId?: number;

    @ApiProperty({ description: 'Se true, retorna todas as células (ignora hierarquia do usuário)', example: true, required: false })
    public all?: boolean;
}
