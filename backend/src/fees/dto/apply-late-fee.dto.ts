import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyLateFeeDto {
  @ApiProperty({
    description: 'Monto a agregar como recargo por mora',
    example: 2000,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  surchargeAmount: number;
}
