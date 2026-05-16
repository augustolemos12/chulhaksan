import { PartialType } from '@nestjs/swagger';
import { CreateClassPlanDto } from './create-class-plan.dto';

export class UpdateClassPlanDto extends PartialType(CreateClassPlanDto) {}
