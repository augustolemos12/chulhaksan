import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'ID de la cuota', example: 1 })
  @IsInt()
  @Type(() => Number)
  feeId: number;

  @ApiProperty({ description: 'Monto del pago (en centavos o unidad entera)', example: 15000 })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Método de pago (CASH o TRANSFER)' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'URL del comprobante (se asigna automáticamente tras la subida)' })
  @IsOptional()
  @IsString()
  proofImageUrl?: string;
}
