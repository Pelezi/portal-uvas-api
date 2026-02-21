import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();

        // Check if request is multipart
        if (!request.isMultipart()) {
            return next.handle();
        }

        try {
            const parts = request.parts();
            const fields: any = {};
            let file: any = null;

            for await (const part of parts) {
                if (part.type === 'file') {
                    // Handle file upload
                    const buffer = await part.toBuffer();
                    file = {
                        fieldname: part.fieldname,
                        originalname: part.filename,
                        encoding: part.encoding,
                        mimetype: part.mimetype,
                        buffer: buffer,
                        size: buffer.length
                    };
                } else {
                    // Handle form field
                    const fieldname = part.fieldname;
                    const value = part.value;

                    // Handle nested fields (e.g., "socialMedia[0][type]")
                    const match = fieldname.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
                    if (match) {
                        const [, arrayName, index, key] = match;
                        if (!fields[arrayName]) {
                            fields[arrayName] = [];
                        }
                        if (!fields[arrayName][Number(index)]) {
                            fields[arrayName][Number(index)] = {};
                        }
                        fields[arrayName][Number(index)][key] = value;
                    } else {
                        // Try to parse as JSON for complex fields
                        try {
                            fields[fieldname] = JSON.parse(value as string);
                        } catch {
                            fields[fieldname] = value;
                        }
                    }
                }
            }

            // Attach file and fields to request
            (request as any).uploadedFile = file;
            (request as any).body = fields;

            return next.handle();
        } catch (error: any) {
            throw new BadRequestException(`File upload error: ${error.message}`);
        }
    }
}
