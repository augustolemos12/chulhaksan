import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { GetAttendanceByClassDateDto } from './dto/get-attendance-by-class-date.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Registrar asistencia de forma masiva para una clase y fecha' })
  recordAttendance(@Req() req, @Body() recordDto: RecordAttendanceDto) {
    return this.attendanceService.recordAttendance(req.user.id, req.user.role, recordDto);
  }


  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener registros de asistencia filtrados' })
  findAll(@Req() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query, req.user.id, req.user.role);
  }

  @Get('class-date')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener asistencia de una clase en una fecha específica' })
  getAttendanceByClassAndDate(@Query() queryDto: GetAttendanceByClassDateDto) {
    return this.attendanceService.getAttendanceByClassAndDate(queryDto.classGroupId, queryDto.date);
  }
}

