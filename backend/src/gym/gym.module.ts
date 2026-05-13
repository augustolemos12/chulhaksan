import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GymController } from './gym.controller';
import { GymService } from './gym.service';

@Module({
  imports: [PrismaModule],
  providers: [GymService],
  controllers: [GymController],
  exports: [GymService],
})
export class GymModule {}
