import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Examen de Cinturones de Mayo',
    description:
      'Título del evento del mes (2–200 caracteres, se elimina el espacio en blanco inicial y final)',
  })
  @IsString()
  @IsNotEmpty({
    message:
      'El título no puede estar vacío ni contener sólo espacios en blanco.',
  })
  @MinLength(2, { message: 'El título debe tener al menos 2 caracteres.' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres.' })
  // Transform se ejecuta ANTES de class-validator, por lo que @IsNotEmpty atrapa
  // correctamente cadenas como "   " (sólo espacios).
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  /**
   * La URL de Cloudinary es inyectada por el controlador tras subir el archivo.
   * El cliente nunca debe enviar este campo directamente.
   */
  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567/chulhaksan_events/sample.jpg',
    description:
      'URL de la imagen en Cloudinary (asignada por el backend, no enviar desde el cliente)',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
