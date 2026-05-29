import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { FeeConfigService } from '../services/fee-config.service';
import { CreateFeeConfigDto } from '../dto/create-fee-config.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Fee Config (Configuración de precios)')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('fee-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeeConfigController {
  constructor(private readonly feeConfigService: FeeConfigService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva configuración de cuota (actualiza el precio vigente)' })
  async create(@Body() createDto: CreateFeeConfigDto) {
    return this.feeConfigService.createFeeConfig(createDto);
  }

  @Get('latest')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener la configuración vigente actual' })
  async getLatest() {
    return this.feeConfigService.getLatestFeeConfig();
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener historial de configuraciones' })
  async getAll() {
    return this.feeConfigService.getAllConfigs();
  }
}
