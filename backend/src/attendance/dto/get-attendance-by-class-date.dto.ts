import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAttendanceByClassDateDto {
  @ApiProperty({ description: 'ID de la Comisión', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  classGroupId: number;

  @ApiProperty({ description: 'Fecha de la clase (YYYY-MM-DD)', example: '2026-05-16' })
  @IsDateString()
  date: string;
}
