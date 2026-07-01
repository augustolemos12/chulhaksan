import { ApiPropertyOptional } from '@nestjs/swagger';
import { StudentCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum BeltGroup {
  GROUP1 = 'group1', // Blancos y puntas amarillas
  GROUP2 = 'group2', // Amarillo a punta azul
  GROUP3 = 'group3', // Azul a punta negra
  GROUP4 = 'group4', // Danes
}

export class CensusQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por gimnasio', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  gymId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por profesor', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  teacherId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
    enum: StudentCategory,
  })
  @IsOptional()
  @IsEnum(StudentCategory)
  category?: StudentCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por grupo de cinturón',
    enum: BeltGroup,
  })
  @IsOptional()
  @IsEnum(BeltGroup)
  beltGroup?: BeltGroup;
}
