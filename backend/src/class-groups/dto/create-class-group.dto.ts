import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, StudentCategory } from '@prisma/client';
import { IsString, IsNotEmpty, IsInt, IsPositive, IsEnum, IsArray, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClassGroupDto {
  @ApiPropertyOptional({ description: 'ID del Profesor (Requerido solo si el creador es Admin)', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  teacherId?: number;

  @ApiProperty({ description: 'ID del Gimnasio al que pertenece', example: 1 })
  @IsInt()
  @IsPositive()
  gymId: number;

  @ApiPropertyOptional({ description: 'Nombre opcional para la comisión', example: 'Turno Mañana' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ description: 'Categoría de alumnos (CHILD o ADULT)', enum: StudentCategory })
  @IsEnum(StudentCategory)
  category: StudentCategory;

  @ApiProperty({ description: 'Días de la semana', enum: DayOfWeek, isArray: true, example: ['MONDAY', 'WEDNESDAY'] })
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek: DayOfWeek[];


  @ApiProperty({ description: 'Hora de inicio (HH:mm)', example: '18:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'El horario debe tener el formato HH:mm' })
  startTime: string;

  @ApiProperty({ description: 'Hora de fin (HH:mm)', example: '19:30' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'El horario debe tener el formato HH:mm' })
  endTime: string;
}
