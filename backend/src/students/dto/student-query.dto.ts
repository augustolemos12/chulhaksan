import { ApiPropertyOptional } from '@nestjs/swagger';
import { Belt, StudentCategory } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class StudentQueryDto {
  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Búsqueda por nombre, apellido o DNI' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por gimnasio', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  gymId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por comisión', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  classGroupId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por categoría', enum: StudentCategory })
  @IsOptional()
  @IsEnum(StudentCategory)
  category?: StudentCategory;

  @ApiPropertyOptional({ description: 'Filtrar por cinturón', enum: Belt })
  @IsOptional()
  @IsEnum(Belt)
  belt?: Belt;

  @ApiPropertyOptional({ description: 'Incluir registros eliminados (soft delete)', example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean = false;
}
