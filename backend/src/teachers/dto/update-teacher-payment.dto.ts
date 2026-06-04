import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTeacherPaymentDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? null : value)
  @IsUrl({}, { message: 'El enlace de la billetera debe ser una URL válida' })
  walletUrl?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? null : value)
  @IsUrl({}, { message: 'El enlace de mora debe ser una URL válida' })
  lateFeeWalletUrl?: string;
}
