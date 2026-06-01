import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Forms')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // ADMIN: Crear forma
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.create(createFormDto);
  }

  // ADMIN & TEACHER: Listar todas las formas
  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll() {
    return this.formsService.findAll();
  }

  // STUDENT: Listar formas desbloqueadas
  @Get('me')
  @Roles(Role.STUDENT)
  findUnlocked(@CurrentUser() user: any) {
    return this.formsService.findUnlockedForStudent(user.id);
  }

  // ADMIN: Actualizar forma
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(id, updateFormDto);
  }

  // ADMIN: Eliminar forma
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.remove(id);
  }
}
