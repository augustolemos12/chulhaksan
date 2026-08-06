import { IsInt, IsDateString, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateFeesDto {
  @ApiProperty({
    description: 'Mes para el cual generar las cuotas',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @ApiProperty({ description: 'Año', example: 2026 })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;

  @ApiProperty({ description: 'Fecha de vencimiento de las cuotas' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}
