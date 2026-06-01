import { IsString, IsNotEmpty, IsUrl, IsEnum } from 'class-validator';
import { Belt } from '@prisma/client';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsEnum(Belt)
  @IsNotEmpty()
  requiredBelt: Belt;
}
