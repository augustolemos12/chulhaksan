import { IsInt, IsDateString, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeeConfigDto {
  @ApiProperty({ description: 'Monto base de la cuota', example: 15000 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  baseAmount: number;

  @ApiProperty({ description: 'Monto del recargo estándar', example: 2000 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lateFee: number;

  @ApiProperty({ description: 'Fecha desde la cual aplica la configuración' })
  @IsDateString()
  @IsNotEmpty()
  validFrom: string;
}
