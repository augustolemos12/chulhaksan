import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GymModule } from './gym/gym.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { ClassGroupsModule } from './class-groups/class-groups.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ClassPlansModule } from './class-plans/class-plans.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    GymModule,
    TeachersModule,
    StudentsModule,
    ClassGroupsModule,
    AttendanceModule,
    ClassPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
