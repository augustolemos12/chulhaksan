import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, Max, Min } from 'class-validator';

export class CreateClassPlanDto {
  @ApiProperty({ description: 'ID de la clase', example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  classGroupId: number;

  @ApiProperty({ description: 'Mes (1-12)', example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @ApiProperty({ description: 'Año', example: 2026 })
  @IsInt()
  @Min(2020)
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    description: 'Cantidad total de clases esperadas',
    example: 8,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  totalClasses: number;
}
