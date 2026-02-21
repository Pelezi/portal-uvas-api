import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CloudFrontService {
    private cloudfrontUrl: string;

    constructor() {
        const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;

        if (!cloudfrontUrl) {
            throw new HttpException('AWS_CLOUDFRONT_URL is not defined in environment variables', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        this.cloudfrontUrl = cloudfrontUrl;
    }

    /**
     * Transform a photoUrl to full CloudFront URL
     * @param photoUrl - The relative photo URL path
     * @returns Full CloudFront URL or null if photoUrl is null/undefined
     */
    public getPhotoUrl(photoUrl: string | null | undefined): string | null {
        if (!photoUrl) {
            return null;
        }

        return `${this.cloudfrontUrl}${photoUrl}`;
    }

    /**
     * Transform photoUrl in a single object
     * @param obj - Object that may contain photoUrl property
     * @returns The same object with transformed photoUrl
     */
    public transformPhotoUrl<T extends { photoUrl?: string | null }>(obj: T | null | undefined): T | null {
        if (!obj) {
            return null;
        }

        if (obj.photoUrl) {
            obj.photoUrl = this.getPhotoUrl(obj.photoUrl);
        }

        return obj;
    }

    /**
     * Transform photoUrl in an array of objects
     * @param array - Array of objects that may contain photoUrl property
     * @returns The same array with transformed photoUrls
     */
    public transformPhotoUrls<T extends { photoUrl?: string | null }>(array: T[]): T[] {
        if (!array || !Array.isArray(array)) {
            return array;
        }

        array.forEach(item => {
            if (item?.photoUrl) {
                item.photoUrl = this.getPhotoUrl(item.photoUrl);
            }
        });

        return array;
    }
}
