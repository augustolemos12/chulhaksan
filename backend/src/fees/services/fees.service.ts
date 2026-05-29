import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeeStatus, PaymentStatus } from '@prisma/client';
import { FeeConfigService } from './fee-config.service';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly feeConfigService: FeeConfigService,
  ) {}

  /**
   * Recalcula el estado financiero de una cuota a partir de sus transacciones aprobadas.
   * Este método es el único autorizado para modificar `paidAmount` y `status`.
   */
  async recalculateFee(feeId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener la cuota y sus transacciones APPROVED
      const fee = await tx.fee.findUnique({
        where: { id: feeId },
        include: {
          payments: {
            where: { status: PaymentStatus.APPROVED },
          },
        },
      });

      if (!fee) {
        throw new NotFoundException(`Fee con ID ${feeId} no encontrada.`);
      }

      // 2. Sumar montos de transacciones aprobadas
      const paidAmount = fee.payments.reduce((sum, payment) => sum + payment.amount, 0);

      // Invariante: paidAmount nunca debe ser negativo
      if (paidAmount < 0) {
        this.logger.error(`Violación de invariante: paidAmount calculado es negativo para Fee ${feeId}`);
        throw new Error('El monto pagado no puede ser negativo.');
      }

      // 3. Determinar nuevo status
      let status: FeeStatus = FeeStatus.PENDING;
      
      // Asumimos que totalAmount siempre está actualizado y representa baseAmount + surchargeAmount
      if (paidAmount >= fee.totalAmount) {
        status = FeeStatus.PAID;
      } else if (paidAmount > 0 && paidAmount < fee.totalAmount) {
        status = FeeStatus.PARTIALLY_PAID;
      }

      // 4. Persistir los cambios
      const updatedFee = await tx.fee.update({
        where: { id: feeId },
        data: {
          paidAmount,
          status,
        },
      });

      this.logger.log(`Fee ${feeId} recalculada: paidAmount=${paidAmount}, status=${status}`);
      return updatedFee;
    });
  }

  /**
   * Aplica de forma manual (o controlada) un recargo por mora a la cuota.
   */
  async applyLateFee(feeId: number, surchargeAmount: number) {
    const fee = await this.prisma.fee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundException(`Fee con ID ${feeId} no encontrada.`);
    }

    const newSurchargeAmount = fee.surchargeAmount + surchargeAmount;
    const newTotalAmount = fee.baseAmount + newSurchargeAmount;

    await this.prisma.fee.update({
      where: { id: feeId },
      data: {
        surchargeAmount: newSurchargeAmount,
        totalAmount: newTotalAmount,
        lateFeeApplied: true,
      },
    });

    // Como el totalAmount cambió, el estado de la cuota podría verse afectado.
    // (Ej: Estaba PAID, pero ahora debe dinero, por lo que vuelve a PARTIALLY_PAID).
    return this.recalculateFee(feeId);
  }

  /**
   * Genera masivamente las cuotas para un mes y año determinado para todos los alumnos.
   * Evita duplicados gracias al unique constraint y a la validación en código.
   */
  async generateMonthlyFees(month: number, year: number, dueDate: Date) {
    const latestConfig = await this.feeConfigService.getLatestFeeConfig();

    // Obtener todos los alumnos activos
    const students = await this.prisma.student.findMany({
      where: { deletedAt: null },
    });

    let createdCount = 0;
    const errors: { studentId: number; error: string }[] = [];

    for (const student of students) {
      try {
        const existingFee = await this.prisma.fee.findUnique({
          where: {
            studentId_month_year: {
              studentId: student.id,
              month,
              year,
            },
          },
        });

        if (!existingFee) {
          await this.prisma.fee.create({
            data: {
              studentId: student.id,
              month,
              year,
              baseAmount: latestConfig.baseAmount,
              totalAmount: latestConfig.baseAmount,
              dueDate: new Date(dueDate),
              status: FeeStatus.PENDING,
              paidAmount: 0,
            },
          });
          createdCount++;
        }
      } catch (err: any) {
        this.logger.error(`Error generando cuota para estudiante ${student.id}: ${err.message}`);
        errors.push({ studentId: student.id, error: err.message });
      }
    }

    return {
      success: true,
      createdCount,
      errors,
    };
  }

  async getFeesForStudent(studentId: number) {
    return this.prisma.fee.findMany({
      where: { studentId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      include: {
        payments: true,
      },
    });
  }

  async getFeeById(feeId: number) {
    const fee = await this.prisma.fee.findUnique({
      where: { id: feeId },
      include: { payments: true },
    });
    if (!fee) throw new NotFoundException(`Fee ${feeId} no encontrada`);
    return fee;
  }
}
