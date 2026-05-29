import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { FeesService } from '../services/fees.service';
import { GenerateFeesDto } from '../dto/generate-fees.dto';
import { ApplyLateFeeDto } from '../dto/apply-late-fee.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Fees (Cuotas)')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post('generate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Generar cuotas mensuales masivamente para todos los alumnos' })
  async generateFees(@Body() dto: GenerateFeesDto) {
    return this.feesService.generateMonthlyFees(dto.month, dto.year, new Date(dto.dueDate));
  }

  @Patch(':id/late-fee')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Aplicar recargo por mora a una cuota específica' })
  async applyLateFee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyLateFeeDto
  ) {
    return this.feesService.applyLateFee(id, dto.surchargeAmount);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Obtener historial de cuotas de un alumno' })
  async getStudentFees(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.feesService.getFeesForStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una cuota' })
  async getFeeById(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.getFeeById(id);
  }
}
