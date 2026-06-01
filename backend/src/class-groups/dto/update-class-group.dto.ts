import { PartialType } from '@nestjs/swagger';
import { CreateClassGroupDto } from './create-class-group.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateClassGroupDto extends PartialType(CreateClassGroupDto) {
  @ApiPropertyOptional({ description: 'Indica si la clase está activa' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
