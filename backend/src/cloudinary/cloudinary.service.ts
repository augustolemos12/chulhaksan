import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
// Usamos require para evitar posibles errores de tipado si faltan los @types por el momento.
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  // Método para subir archivos a Cloudinary
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      // Configuración de la subida
      // El método upload_stream crea una stream de subida a Cloudinary
      // Un stream es una forma de procesar datos en trozos (chunks) en lugar de cargar todo el archivo en memoria a la vez
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chulhaksan_events', // Carpeta en Cloudinary
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Result is undefined'));
          resolve(result);
        },
      );

      // Pipe del buffer del archivo a la stream de subida
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Elimina una imagen de Cloudinary a partir de su public_id.
   * El public_id se extrae de la URL guardada en la base de datos.
   * Ejemplo de URL: https://res.cloudinary.com/demo/image/upload/v123/chulhaksan_events/abc123.jpg
   * → public_id: chulhaksan_events/abc123
   */
  deleteFile(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Extrae el public_id de una URL de Cloudinary.
   * Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/chulhaksan_events/abc123.jpg
   * → chulhaksan_events/abc123
   */
  extractPublicId(imageUrl: string): string {
    // Eliminamos la extensión y tomamos la parte del path a partir de "upload/"
    const uploadIndex = imageUrl.indexOf('/upload/');
    if (uploadIndex === -1) return '';
    const afterUpload = imageUrl.slice(uploadIndex + '/upload/'.length);
    // Eliminamos el prefijo de versión (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Eliminamos la extensión del archivo
    return withoutVersion.replace(/\.[^/.]+$/, '');
  }
}
