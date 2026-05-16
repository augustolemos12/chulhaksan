import { Module } from '@nestjs/common';
import { ClassPlansService } from './class-plans.service';
import { ClassPlansController } from './class-plans.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassPlansController],
  providers: [ClassPlansService],
  exports: [ClassPlansService],
})
export class ClassPlansModule {}
