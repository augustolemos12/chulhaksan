import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ClassGroupsService } from './class-groups.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { ClassGroupQueryDto } from './dto/class-group-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Class Groups (Mis Clases)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('class-groups')
export class ClassGroupsController {
  constructor(private readonly classGroupsService: ClassGroupsService) {}

  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear una nueva clase' })
  @Post()
  create(@Req() req, @Body() createClassGroupDto: CreateClassGroupDto) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.classGroupsService.create(
      req.user.id,
      isAdmin,
      createClassGroupDto,
    );
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las clases (Solo Admin)' })
  @Get()
  findAll(@Query() query: ClassGroupQueryDto) {
    return this.classGroupsService.findAll(query);
  }

  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Obtener las clases del profesor autenticado' })
  @Get('my-groups')
  findMyGroups(@Req() req, @Query() query: ClassGroupQueryDto) {
    return this.classGroupsService.findMyGroupsByUser(req.user.id, query);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener una clase por ID' })
  @Get(':id')
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.classGroupsService.findOne(id, req.user);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una clase' })
  @Patch(':id')
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassGroupDto: UpdateClassGroupDto,
  ) {
    const teacherUserId = req.user.role === Role.TEACHER ? req.user.id : null;
    return this.classGroupsService.update(
      id,
      teacherUserId,
      updateClassGroupDto,
    );
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Eliminar una clase' })
  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const teacherUserId = req.user.role === Role.TEACHER ? req.user.id : null;
    return this.classGroupsService.remove(id, teacherUserId);
  }
}
