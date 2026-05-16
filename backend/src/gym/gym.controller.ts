import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GymService } from './gym.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymQueryDto } from './dto/gym-query.dto';

@ApiTags('Gyms (Admin/Teacher)')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
@Controller('gyms')
export class GymController {
  constructor(private readonly gymService: GymService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createGymDto: CreateGymDto) {
    return this.gymService.create(createGymDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: GymQueryDto) {
    return this.gymService.findAll(query);
  }

  @Get('my')
  @Roles(Role.TEACHER)
  findMyGyms(
    @Query() query: GymQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.gymService.findMyGymsByUser(user.id, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gymService.findOne(id);
  }


  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGymDto: UpdateGymDto,
  ) {
    return this.gymService.update(id, updateGymDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.remove(id);
  }
}