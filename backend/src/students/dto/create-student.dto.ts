import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Belt, StudentCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'DNI del alumno', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  dni: string;

  @ApiPropertyOptional({
    description: 'Contraseña temporal (opcional, si no se envía se autogenera)',
    example: 'Temporal123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

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

  @ApiPropertyOptional({
    description: 'ID del Gimnasio al que pertenece',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  gymId?: number;

  @ApiProperty({ description: 'ID de la clase', example: 1 })
  @IsInt()
  @IsPositive()
  classGroupId: number;

  @ApiPropertyOptional({
    description: 'ID del Profesor (Requerido solo si el creador es Admin)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  teacherId?: number;

  @ApiProperty({ description: 'Categoría del alumno', enum: StudentCategory })
  @IsEnum(StudentCategory)
  category: StudentCategory;

  @ApiProperty({ description: 'Cinturón actual', enum: Belt })
  @IsEnum(Belt)
  currentBelt: Belt;

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
    description: 'Dirección física',
    example: 'Calle Falsa 123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  address?: string;
}
