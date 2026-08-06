import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeesService } from '../../fees/services/fees.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feesService: FeesService,
  ) {}

  /**
   * Reportado por un alumno. Queda PENDING hasta que el profesor lo apruebe.
   */
  async reportPayment(data: CreateTransactionDto) {
    const fee = await this.prisma.fee.findUnique({ where: { id: data.feeId } });
    if (!fee) {
      throw new NotFoundException(`Fee ${data.feeId} no encontrada`);
    }

    if (data.method === PaymentMethod.TRANSFER && !data.proofImageUrl) {
      throw new BadRequestException(
        'Se requiere comprobante para pagos por transferencia',
      );
    }

    return this.prisma.transaction.create({
      data: {
        feeId: data.feeId,
        amount: data.amount,
        method: data.method,
        status: PaymentStatus.PENDING,
        proofImageUrl: data.proofImageUrl,
      },
    });
  }

  /**
   * Registrado directamente por el profesor. Queda APPROVED automáticamente y recalcula la cuota.
   */
  async registerDirectPayment(data: CreateTransactionDto) {
    const fee = await this.prisma.fee.findUnique({ where: { id: data.feeId } });
    if (!fee) {
      throw new NotFoundException(`Fee ${data.feeId} no encontrada`);
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        feeId: data.feeId,
        amount: data.amount,
        method: data.method,
        status: PaymentStatus.APPROVED,
        proofImageUrl: data.proofImageUrl,
        reviewedAt: new Date(),
      },
    });

    await this.feesService.recalculateFee(transaction.feeId);
    return transaction;
  }

  async approveTransaction(transactionId: number, amount?: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction)
      throw new NotFoundException(`Transaction ${transactionId} no encontrada`);

    if (transaction.status === PaymentStatus.APPROVED) {
      return transaction; // Already approved
    }

    const dataToUpdate: any = {
      status: PaymentStatus.APPROVED,
      reviewedAt: new Date(),
    };

    if (amount !== undefined && amount > 0) {
      dataToUpdate.amount = amount;
    }

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: dataToUpdate,
    });

    // ¡Recalcular la cuota!
    await this.feesService.recalculateFee(transaction.feeId);

    return this.prisma.transaction.findUnique({ where: { id: transactionId } });
  }

  async rejectTransaction(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction)
      throw new NotFoundException(`Transaction ${transactionId} no encontrada`);

    // Si estaba APPROVED y la rechazamos, tenemos que revertir el pago de la cuota.
    const wasApproved = transaction.status === PaymentStatus.APPROVED;

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: PaymentStatus.REJECTED,
        reviewedAt: new Date(),
      },
    });

    if (wasApproved) {
      // ¡Recalcular la cuota para restar el monto!
      await this.feesService.recalculateFee(transaction.feeId);
    }

    return this.prisma.transaction.findUnique({ where: { id: transactionId } });
  }

  async getPendingTransactions() {
    return this.prisma.transaction.findMany({
      where: { status: PaymentStatus.PENDING },
      include: {
        fee: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTransactionsByStudent(studentId: number) {
    return this.prisma.transaction.findMany({
      where: { fee: { studentId } },
      include: { fee: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
