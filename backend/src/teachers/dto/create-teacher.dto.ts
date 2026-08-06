import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeacherDto {
  @ApiProperty({ description: 'DNI del profesor', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  dni: string;

  @ApiProperty({ description: 'Nombre', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ description: 'Apellido', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '+541123456789' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'juan.perez@example.com',
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Contraseña temporal (opcional, si no se envía se autogenera)',
    example: 'Temporal123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
