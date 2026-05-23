import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Examen de Cinturones de Mayo',
    description: 'Título del evento del mes',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1234567/sample.jpg',
    description: 'URL de la imagen del evento almacenada en Cloudinary',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @Transform(({ value }) => value?.trim())
  imageUrl?: string;
}
