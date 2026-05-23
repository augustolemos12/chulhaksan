import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
// Usamos require para evitar posibles errores de tipado si faltan los @types por el momento.
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  /**
   * Sube un archivo a Cloudinary aplicando transformaciones mobile-first:
   * - Relación de aspecto 16:9 horizontal
   * - Crop inteligente (gravity: auto) para centrar el sujeto
   * - Calidad automática (quality: auto)
   * - Formato automático (fetch_format: auto → WebP/AVIF según el navegador)
   * - Ancho máximo de 1200 px
   *
   * No se guardan archivos locales: se usa stream directo desde el buffer en memoria.
   */
  uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chulhaksan_events',
          // ── Transformaciones ─────────────────────────────────────────────
          transformation: [
            {
              width: 1200,
              aspect_ratio: '16:9',
              crop: 'fill',     // Recorta para cubrir exactamente el área 16:9
              gravity: 'auto',  // El SDK detecta el sujeto principal (cara, objeto, etc.)
              quality: 'auto',  // Cloudinary elige la calidad óptima por sí mismo
              fetch_format: 'auto', // Sirve WebP, AVIF, etc. según el navegador del cliente
            },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary no devolvió resultado'));
          resolve(result);
        },
      );

      // Crea un readable stream a partir del buffer en memoria y lo pipe-a a Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Elimina una imagen de Cloudinary a partir de su public_id.
   * El public_id se extrae de la URL guardada en la base de datos.
   * Ejemplo de URL:
   *   https://res.cloudinary.com/demo/image/upload/v123/chulhaksan_events/abc123.jpg
   * → public_id: chulhaksan_events/abc123
   */
  deleteFile(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Extrae el public_id de una URL de Cloudinary.
   *
   * Ejemplo:
   *   https://res.cloudinary.com/demo/image/upload/v1234567890/chulhaksan_events/abc123.jpg
   * → chulhaksan_events/abc123
   */
  extractPublicId(imageUrl: string): string {
    const uploadIndex = imageUrl.indexOf('/upload/');
    if (uploadIndex === -1) return '';

    const afterUpload = imageUrl.slice(uploadIndex + '/upload/'.length);
    // Elimina el prefijo de versión opcional: v1234567890/
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Elimina la extensión del archivo
    return withoutVersion.replace(/\.[^/.]+$/, '');
  }
}
