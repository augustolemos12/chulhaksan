import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsPositive, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de Clase', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  classGroupId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de Alumno', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  studentId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por fecha exacta (YYYY-MM-DD)', example: '2026-05-16' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Filtrar desde esta fecha (YYYY-MM-DD)', example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar hasta esta fecha (YYYY-MM-DD)', example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar por mes', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ description: 'Filtrar por año', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  year?: number;
}
