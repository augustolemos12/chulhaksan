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

  //ADMIN - Crear un alumno
  @Post('students')
  @Roles(Role.ADMIN)
  createAdmin(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: any) {
    return this.studentsService.create(user.id, true, createStudentDto);
  }
  
  //ADMIN - Obtener todos los alumnos
  @Get('students')
  @Roles(Role.ADMIN)
  findAllAdmin(@Query() query: StudentQueryDto) {
    return this.studentsService.findAll(query);
  }

  //STUDENT - Obtener su propio perfil (alternativa)
  @Get('students/me')
  @Roles(Role.STUDENT)
  findOwnProfileAlternative(@CurrentUser() user: any) {
    return this.studentsService.findOwnProfile(user.id);
  }

  //STUDENT - Obtener los datos de su profesor asignado
  @Get('students/me/teacher')
  @Roles(Role.STUDENT)
  findOwnTeacher(@CurrentUser() user: any) {
    return this.studentsService.findOwnTeacher(user.id);
  }

  //ADMIN - Obtener un alumno por ID
  @Get('students/:id')
  @Roles(Role.ADMIN)
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  //ADMIN - Actualizar un alumno
  @Patch('students/:id')
  @Roles(Role.ADMIN)
  updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, null, updateStudentDto);
  }
  
  //ADMIN - Eliminar un alumno
  @Delete('students/:id')
  @Roles(Role.ADMIN)
  removeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id, null);
  }

  // ==========================================
  // ENDPOINTS TEACHER
  // ==========================================

  //TEACHER - Obtener todos los alumnos
  @Get('teacher/students')
  @Roles(Role.TEACHER)
  findTeacherStudents(@Query() query: StudentQueryDto, @CurrentUser() user: any) {
    return this.studentsService.findByTeacher(user.id, query);
  }

  //TEACHER - Crear un alumno
  @Post('teacher/students')
  @Roles(Role.TEACHER)
  createTeacherStudent(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: any) {
    return this.studentsService.create(user.id, false, createStudentDto);
  }

  //TEACHER - Actualizar un alumno
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

  //STUDENT - Obtener su propio perfil
  @Get('me/student')
  @Roles(Role.STUDENT)
  findOwnProfile(@CurrentUser() user: any) {
    return this.studentsService.findOwnProfile(user.id);
  }

  //STUDENT - Actualizar su propio perfil
  @Patch('me/student')
  @Roles(Role.STUDENT)
  updateOwnProfile(@Body() updateOwnProfileDto: UpdateOwnStudentProfileDto, @CurrentUser() user: any) {
    return this.studentsService.updateOwnProfile(user.id, updateOwnProfileDto);
  }

  //TEACHER - Obtener todos los alumnos (ruta esperada por frontend)
  @Get('teachers/me/students')
  @Roles(Role.TEACHER)
  findTeacherStudentsAlternative(@Query() query: StudentQueryDto, @CurrentUser() user: any) {
    return this.studentsService.findByTeacher(user.id, query);
  }
}
