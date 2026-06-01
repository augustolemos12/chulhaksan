import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @ApiProperty({ description: 'ID del Alumno', example: 1 })
  @IsInt()
  @IsPositive()
  studentId: number;

  @ApiProperty({ description: 'Indica si estuvo presente', example: true })
  @IsBoolean()
  present: boolean;
}

export class RecordAttendanceDto {
  @ApiProperty({ description: 'ID de la Clase', example: 1 })
  @IsInt()
  @IsPositive()
  classGroupId: number;

  @ApiProperty({ description: 'Fecha de la clase (YYYY-MM-DD)', example: '2026-05-16' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Registros de asistencia', type: [AttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
