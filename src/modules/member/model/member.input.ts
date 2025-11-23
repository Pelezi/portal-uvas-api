import { ApiProperty } from '@nestjs/swagger';

export class MemberInput {
    @ApiProperty({ description: 'Member name', example: 'Maria Silva' })
    public readonly name: string;
}
