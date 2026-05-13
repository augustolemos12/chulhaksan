import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGymDto {
  @ApiProperty({
    example: 'Sede Central',
    description: 'Nombre del gimnasio',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del profesor propietario (opcional al crear)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  teacherId?: number;
}