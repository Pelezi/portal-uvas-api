import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '../types/authenticated-request.interface';
import { extractTokenPayload } from './security-utils';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RestrictedGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean {

        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<FastifyRequest>() as AuthenticatedRequest;
        const payload = extractTokenPayload(request);
        if (!payload) {
            return false;
        }

        // Attach user info to request for use in controllers
        request.member = {
            id: payload.userId,
            matrixId: payload.matrixId
        };

        return true;
    }

}
