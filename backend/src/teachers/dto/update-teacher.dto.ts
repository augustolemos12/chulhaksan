import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';

export class UpdateTeacherDto extends PartialType(
  OmitType(CreateTeacherDto, ['dni', 'password'] as const)
) {}
