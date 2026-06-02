import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateTeacherPaymentDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'El enlace de la billetera debe ser una URL válida' })
  walletUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'El enlace de mora debe ser una URL válida' })
  lateFeeWalletUrl?: string;
}
