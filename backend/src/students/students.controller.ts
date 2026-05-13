import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateOwnStudentProfileDto } from './dto/update-own-student-profile.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // ==========================================
  // ENDPOINTS ADMIN
  // ==========================================

  @Post('students')
  @Roles(Role.ADMIN)
  createAdmin(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: any) {
    return this.studentsService.create(user.id, true, createStudentDto);
  }

  @Get('students')
  @Roles(Role.ADMIN)
  findAllAdmin(@Query() query: StudentQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get('students/:id')
  @Roles(Role.ADMIN)
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch('students/:id')
  @Roles(Role.ADMIN)
  updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, null, updateStudentDto);
  }

  @Delete('students/:id')
  @Roles(Role.ADMIN)
  removeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id, null);
  }

  // ==========================================
  // ENDPOINTS TEACHER
  // ==========================================

  @Get('teacher/students')
  @Roles(Role.TEACHER)
  findTeacherStudents(@Query() query: StudentQueryDto, @CurrentUser() user: any) {
    return this.studentsService.findByTeacher(user.id, query);
  }

  @Post('teacher/students')
  @Roles(Role.TEACHER)
  createTeacherStudent(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: any) {
    return this.studentsService.create(user.id, false, createStudentDto);
  }

  @Patch('teacher/students/:id')
  @Roles(Role.TEACHER)
  updateTeacherStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentsService.update(id, user.id, updateStudentDto);
  }

  // ==========================================
  // ENDPOINTS STUDENT
  // ==========================================

  @Get('me/student')
  @Roles(Role.STUDENT)
  findOwnProfile(@CurrentUser() user: any) {
    return this.studentsService.findOwnProfile(user.id);
  }

  @Patch('me/student')
  @Roles(Role.STUDENT)
  updateOwnProfile(@Body() updateOwnProfileDto: UpdateOwnStudentProfileDto, @CurrentUser() user: any) {
    return this.studentsService.updateOwnProfile(user.id, updateOwnProfileDto);
  }
}
