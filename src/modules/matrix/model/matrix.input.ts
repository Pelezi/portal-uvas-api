import { ApiProperty } from '@nestjs/swagger';

export class MatrixCreateInput {
    @ApiProperty({ description: 'Matrix name', example: 'Igreja Videira Caruaru' })
    public readonly name: string;

    @ApiProperty({ description: 'Matrix domains', example: ['videira-caruaru.com.br', 'localhost:3000'], type: [String] })
    public readonly domains: string[];

    @ApiProperty({ description: 'SMTP host for matrix emails', example: 'smtp.gmail.com', required: false })
    public readonly smtpHost?: string;

    @ApiProperty({ description: 'SMTP port for matrix emails', example: 587, required: false })
    public readonly smtpPort?: number;

    @ApiProperty({ description: 'SMTP username for matrix emails', example: 'contato@igreja.com', required: false })
    public readonly smtpUser?: string;

    @ApiProperty({ description: 'SMTP password for matrix emails', example: 'app-password', required: false })
    public readonly smtpPass?: string;

    @ApiProperty({ description: 'Sender email used in matrix emails', example: 'contato@igreja.com', required: false })
    public readonly smtpFrom?: string;
}

export class MatrixUpdateInput {
    @ApiProperty({ description: 'Matrix name', example: 'Igreja Videira', required: false })
    public readonly name?: string;

    @ApiProperty({ description: 'Matrix domains', example: ['videira.com.br'], type: [String], required: false })
    public readonly domains?: string[];

    @ApiProperty({ description: 'WhatsApp Manager API Key', example: 'sk-abc123xyz', required: false })
    public readonly whatsappApiKey?: string;

    @ApiProperty({ description: 'SMTP host for matrix emails', example: 'smtp.gmail.com', required: false })
    public readonly smtpHost?: string;

    @ApiProperty({ description: 'SMTP port for matrix emails', example: 587, required: false })
    public readonly smtpPort?: number;

    @ApiProperty({ description: 'SMTP username for matrix emails', example: 'contato@igreja.com', required: false })
    public readonly smtpUser?: string;

    @ApiProperty({ description: 'SMTP password for matrix emails', example: 'app-password', required: false })
    public readonly smtpPass?: string;

    @ApiProperty({ description: 'Sender email used in matrix emails', example: 'contato@igreja.com', required: false })
    public readonly smtpFrom?: string;

    @ApiProperty({ description: 'PIX Code for donations', example: '00020126...', required: false })
    public readonly pixCode?: string;

    @ApiProperty({ description: 'PIX Key for donations', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
    public readonly pixKey?: string;

    @ApiProperty({ description: 'WhatsApp number for contact button', example: '5581999999999', required: false })
    public readonly whatsappNumber?: string;

    @ApiProperty({ description: 'Instagram username', example: 'igrejavirus', required: false })
    public readonly instagramUrl?: string;

    @ApiProperty({ description: 'Facebook username or page name', example: 'igrejavirus', required: false })
    public readonly facebookUrl?: string;

    @ApiProperty({ description: 'YouTube channel handle', example: '@igrejavirus', required: false })
    public readonly youtubeUrl?: string;
}

export class MatrixDomainCreateInput {
    @ApiProperty({ description: 'Domain name', example: 'videira-caruaru.com.br' })
    public readonly domain: string;

    @ApiProperty({ description: 'Matrix ID', example: 1 })
    public readonly matrixId: number;
}
