import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeeStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
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
      const paidAmount = fee.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      // Invariante: paidAmount nunca debe ser negativo
      if (paidAmount < 0) {
        this.logger.error(
          `Violación de invariante: paidAmount calculado es negativo para Fee ${feeId}`,
        );
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

      this.logger.log(
        `Fee ${feeId} recalculada: paidAmount=${paidAmount}, status=${status}`,
      );
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
        this.logger.error(
          `Error generando cuota para estudiante ${student.id}: ${err.message}`,
        );
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
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
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

  async getAllFees(filters: {
    month?: number;
    year?: number;
    status?: FeeStatus;
    studentId?: number;
    teacherId?: number;
  }) {
    const { month, year, status, studentId, teacherId } = filters;
    const where: any = {};
    if (month !== undefined) where.month = month;
    if (year !== undefined) where.year = year;
    if (status) where.status = status;
    if (studentId !== undefined) where.studentId = studentId;

    if (teacherId !== undefined) {
      where.student = {
        ...where.student,
        teacherId,
      };
    }

    return this.prisma.fee.findMany({
      where,
      include: {
        student: true,
        payments: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { student: { lastName: 'asc' } },
      ],
    });
  }

  async payFullYear(
    studentId: number,
    year: number,
    method: PaymentMethod = PaymentMethod.CASH,
    proofImageUrl?: string,
  ) {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();

    // Si el año a pagar es el actual, empezamos desde el mes actual. Si es un año futuro, desde enero.
    const startMonth = year === currentYear ? currentMonth : 1;

    const latestConfig = await this.feeConfigService.getLatestFeeConfig();

    for (let month = startMonth; month <= 12; month++) {
      let fee = await this.prisma.fee.findUnique({
        where: {
          studentId_month_year: {
            studentId,
            month,
            year,
          },
        },
      });

      // Si no existe, la creamos
      if (!fee) {
        // Fijamos vencimiento el día 10 del mes (o similar)
        const dueDate = new Date(year, month - 1, 10);
        fee = await this.prisma.fee.create({
          data: {
            studentId,
            month,
            year,
            baseAmount: latestConfig.baseAmount,
            totalAmount: latestConfig.baseAmount,
            dueDate,
            status: FeeStatus.PENDING,
            paidAmount: 0,
          },
        });
      }

      // Si no está pagada totalmente, registramos un pago en efectivo por el monto restante
      if (fee.status !== FeeStatus.PAID) {
        const remainingAmount = fee.totalAmount - fee.paidAmount;
        if (remainingAmount > 0) {
          await this.prisma.transaction.create({
            data: {
              feeId: fee.id,
              amount: remainingAmount,
              method,
              status: PaymentStatus.APPROVED,
              proofImageUrl,
              reviewedAt: new Date(),
            },
          });
          // Recalcular el estado de la cuota
          await this.recalculateFee(fee.id);
        }
      }
    }

    return {
      success: true,
      message: `Año ${year} marcado como pagado para el alumno ${studentId}`,
    };
  }
}
