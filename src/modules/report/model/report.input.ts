import { ApiProperty } from '@nestjs/swagger';

export class ReportCreateInput {
    @ApiProperty({ description: 'Array of member IDs to include in the report', example: [1, 2, 3] })
    public readonly memberIds: number[];
    @ApiProperty({ description: 'Optional date for the report (yyyy-mm-dd)', example: '2025-11-25', required: false })
    public readonly date?: string;
}
