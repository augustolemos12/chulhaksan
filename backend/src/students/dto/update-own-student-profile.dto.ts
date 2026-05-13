import { PickType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

export class UpdateOwnStudentProfileDto extends PickType(CreateStudentDto, [
  'phone',
  'email',
  'address',
] as const) {}
