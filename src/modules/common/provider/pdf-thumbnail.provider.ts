import { Injectable } from '@nestjs/common';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';

@Injectable()
export class PdfThumbnailService {
  /**
   * Generate thumbnail from first page of PDF
   * @param pdfBuffer - Buffer containing PDF file
   * @param width - Desired thumbnail width (default: 400)
   * @returns Buffer containing PNG image of first page
   */
  async generateThumbnail(pdfBuffer: Buffer, width: number = 400): Promise<Buffer> {
    try {
      // Convert first page of PDF to image
      const document = await pdf(pdfBuffer, { scale: 2.0 });
      const firstPageBuffer = await document.getPage(1);
      
      if (!firstPageBuffer) {
        throw new Error('Failed to extract first page from PDF');
      }

      // Resize using sharp
      const resizedBuffer = await sharp(firstPageBuffer)
        .resize(width, Math.round(width * 1.414), { // A4 aspect ratio
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toBuffer();

      return resizedBuffer;
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      throw new Error(`Failed to generate PDF thumbnail: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail and return as JPEG with compression
   * @param pdfBuffer - Buffer containing PDF file
   * @param width - Desired thumbnail width (default: 400)
   * @param quality - JPEG quality 0-100 (default: 85)
   * @returns Buffer containing JPEG image of first page
   */
  async generateThumbnailJpeg(
    pdfBuffer: Buffer,
    width: number = 400,
    quality: number = 85
  ): Promise<Buffer> {
    try {      
      // Convert first page of PDF to image using pdf-to-img (pdfium via WASM)
      const document = await pdf(pdfBuffer, { scale: 2.0 }); // Higher scale for better quality
      const firstPageBuffer = await document.getPage(1);
      
      if (!firstPageBuffer) {
        throw new Error('Failed to extract first page from PDF');
      }

      // Process with sharp: resize and convert to JPEG
      const jpegBuffer = await sharp(firstPageBuffer)
        .jpeg({ quality })
        .toBuffer();

      return jpegBuffer;
    } catch (error) {
      console.error('[PDF Thumbnail] Error generating PDF thumbnail:', error);
      throw new Error(`Failed to generate PDF thumbnail: ${error.message}`);
    }
  }
}
