import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';
import { PermissionService } from './permission.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly permissionService: PermissionService,
        private reflector: Reflector
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

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
                congregacaoIds: [],
                redeIds: [],
                discipuladoIds: []
            };
            return true;
        }

        request.permission = permission;

        return true;
    }
}