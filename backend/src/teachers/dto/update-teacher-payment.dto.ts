import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTeacherPaymentDto {
  @IsOptional()
  @IsString({ message: 'El alias debe ser un texto válido' })
  @Transform(({ value }) => (value === '' ? null : value))
  walletUrl?: string;

  @IsOptional()
  @IsString({ message: 'El alias de mora debe ser un texto válido' })
  @Transform(({ value }) => (value === '' ? null : value))
  lateFeeWalletUrl?: string;
}
