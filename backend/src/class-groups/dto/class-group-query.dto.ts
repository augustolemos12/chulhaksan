import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsPositive, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ClassGroupQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por profesor', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return parseInt(value, 10);
  })
  teacherId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por gimnasio', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return parseInt(value, 10);
  })
  gymId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  isActive?: boolean;
}
