import { ApiProperty } from '@nestjs/swagger';

export class RedeCreateInput {
    @ApiProperty({ description: 'Nome da rede', example: 'Rede Norte' })
    public readonly name: string;

    @ApiProperty({ description: 'User id of the pastor for this rede', required: true })
    public readonly pastorUserId: number;
}
