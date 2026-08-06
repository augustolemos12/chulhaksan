import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FeesService } from '../services/fees.service';
import { GenerateFeesDto } from '../dto/generate-fees.dto';
import { ApplyLateFeeDto } from '../dto/apply-late-fee.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;

@ApiTags('Fees (Cuotas)')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(
    private readonly feesService: FeesService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('generate')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Generar cuotas mensuales masivamente para todos los alumnos',
  })
  async generateFees(@Body() dto: GenerateFeesDto) {
    return this.feesService.generateMonthlyFees(
      dto.month,
      dto.year,
      new Date(dto.dueDate),
    );
  }

  @Patch(':id/late-fee')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Aplicar recargo por mora a una cuota específica' })
  async applyLateFee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyLateFeeDto,
  ) {
    return this.feesService.applyLateFee(id, dto.surchargeAmount);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Obtener historial de cuotas de un alumno' })
  async getStudentFees(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.feesService.getFeesForStudent(studentId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({
    summary:
      'Obtener todas las cuotas con filtros (mes, año, status, studentId)',
  })
  async getAllFees(
    @Request() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    let teacherId: number | undefined;
    if (req.user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: req.user.id },
      });
      if (teacher) {
        teacherId = teacher.id;
      }
    }

    return this.feesService.getAllFees({
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      status: status as any, // Ya que status corresponde a FeeStatus
      studentId: studentId ? parseInt(studentId, 10) : undefined,
      teacherId,
    });
  }

  @Post('pay-year')
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Marcar el año completo como pagado para un alumno',
  })
  async payFullYear(
    @Body('studentId', ParseIntPipe) studentId: number,
    @Body('year', ParseIntPipe) year: number,
    @Body('method') method: PaymentMethod = PaymentMethod.CASH,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME_TYPES }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    let proofImageUrl: string | undefined;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadReceipt(file);
      proofImageUrl = uploadResult.secure_url;
    }
    return this.feesService.payFullYear(studentId, year, method, proofImageUrl);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una cuota' })
  async getFeeById(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.getFeeById(id);
  }
}
