import { ApiProperty } from '@nestjs/swagger';

export class PermissionUpsertInput {
    @ApiProperty({ description: 'User email to grant/modify permissions', example: 'admin@example.com' })
    public readonly email: string;

    @ApiProperty({ description: 'List of celula IDs for this permission', required: false, example: [1, 2] })
    public readonly celulaIds?: number[];

    @ApiProperty({ description: 'Grant global access to all celulas', required: false, example: false })
    public readonly hasGlobalCelulaAccess?: boolean;

    @ApiProperty({ description: 'Allow managing celulas', required: false, example: true })
    public readonly canManageCelulas?: boolean;

    @ApiProperty({ description: 'Allow managing permissions', required: false, example: true })
    public readonly canManagePermissions?: boolean;
}
