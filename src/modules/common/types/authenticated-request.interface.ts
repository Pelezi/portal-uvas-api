import { FastifyRequest } from 'fastify';
import { LoadedPermission } from '../security/permission.service';

export interface AuthenticatedRequest extends FastifyRequest {
    member?: {
        id: number;
    };
    permission?: LoadedPermission;
}
