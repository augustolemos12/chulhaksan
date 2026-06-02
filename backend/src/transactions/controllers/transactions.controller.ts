import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role, PaymentMethod } from '@prisma/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;

@ApiTags('Transactions (Pagos de Cuotas)')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('report')
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Reportar un pago (subir comprobante si es transferencia)' })
  async reportPayment(
    @Body() dto: CreateTransactionDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME_TYPES }),
        ],
      }),
    ) file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadReceipt(file);
      dto.proofImageUrl = uploadResult.secure_url;
    }
    return this.transactionsService.reportPayment(dto);
  }

  @Post('direct')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Registrar un pago en efectivo directamente (APPROVED automático)' })
  async registerDirectPayment(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.registerDirectPayment(dto);
  }

  @Patch(':id/approve')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Aprobar un pago PENDING' })
  async approveTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount?: number
  ) {
    return this.transactionsService.approveTransaction(id, amount);
  }

  @Patch(':id/reject')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Rechazar un pago' })
  async rejectTransaction(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.rejectTransaction(id);
  }

  @Get('pending')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Obtener pagos pendientes de revisión' })
  async getPendingTransactions() {
    return this.transactionsService.getPendingTransactions();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Obtener pagos de un alumno específico' })
  async getStudentTransactions(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.transactionsService.getTransactionsByStudent(studentId);
  }
}
