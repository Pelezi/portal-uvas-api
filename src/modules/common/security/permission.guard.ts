import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';
import { PermissionService } from './permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly permissionService: PermissionService
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const member = request.member;
        if (!member || !member.id) {
            return false;
        }

        const permission = await this.permissionService.loadPermissionForMember(member.id);
        
        // Se não houver permissão, retornar permissão vazia em vez de bloquear
        if (!permission) {
            request.permission = {
                id: member.id,
                isAdmin: false,
                ministryType: null,
                ministryPositionId: null,
                celulaIds: [],
                redeIds: [],
                discipuladoIds: []
            };
            return true;
        }

        request.permission = permission;

        return true;
    }
}