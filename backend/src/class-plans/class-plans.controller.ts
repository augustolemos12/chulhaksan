import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClassPlansService } from './class-plans.service';
import { CreateClassPlanDto } from './dto/create-class-plan.dto';
import { UpdateClassPlanDto } from './dto/update-class-plan.dto';
import { ClassPlanQueryDto } from './dto/class-plan-query.dto';

@ApiTags('Class Plans (Expected classes per month)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('class-plans')
export class ClassPlansController {
  constructor(private readonly classPlansService: ClassPlansService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear un plan de clases esperado para un mes' })
  create(
    @Body() createClassPlanDto: CreateClassPlanDto,
    @CurrentUser() user: any,
  ) {
    return this.classPlansService.create(createClassPlanDto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener planes de clases con filtros' })
  findAll(
    @Query() query: ClassPlanQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.classPlansService.findAll(query, user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener un plan de clases específico' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.classPlansService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar un plan de clases' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassPlanDto: UpdateClassPlanDto,
    @CurrentUser() user: any,
  ) {
    return this.classPlansService.update(id, updateClassPlanDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Eliminar un plan de clases (Hard Delete)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.classPlansService.remove(id, user);
  }
}
