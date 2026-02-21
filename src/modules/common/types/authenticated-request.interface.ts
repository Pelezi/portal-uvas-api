import { FastifyRequest } from 'fastify';
import { LoadedPermission } from '../security/permission.service';

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
    member?: {
        id: number;
        matrixId: number;
    };
    permission: LoadedPermission;
    uploadedFile?: UploadedFile;
}
