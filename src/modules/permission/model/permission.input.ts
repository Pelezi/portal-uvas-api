import { ApiProperty } from '@nestjs/swagger';

export class PermissionUpsertInput {
    @ApiProperty({ description: 'User email to grant/modify permissions', example: 'admin@example.com' })
    public readonly email: string;

    @ApiProperty({ description: 'List of cell IDs for this permission', required: false, example: [1, 2] })
    public readonly cellIds?: number[];

    @ApiProperty({ description: 'Grant global access to all cells', required: false, example: false })
    public readonly hasGlobalCellAccess?: boolean;

    @ApiProperty({ description: 'Allow managing cells', required: false, example: true })
    public readonly canManageCells?: boolean;

    @ApiProperty({ description: 'Allow managing permissions', required: false, example: true })
    public readonly canManagePermissions?: boolean;
}
