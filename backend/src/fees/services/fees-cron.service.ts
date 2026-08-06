import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { FeesService } from './fees.service';
import { FeeConfigService } from './fee-config.service';
import { FeeStatus } from '@prisma/client';

@Injectable()
export class FeesCronService {
  private readonly logger = new Logger(FeesCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly feesService: FeesService,
    private readonly feeConfigService: FeeConfigService,
  ) {}

  /**
   * Se ejecuta todos los días a la medianoche.
   * Busca todas las cuotas vencidas a las que no se les haya aplicado mora
   * y les aplica el recargo correspondiente a la configuración global actual.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleLateFees() {
    this.logger.log('Iniciando proceso de cobro de mora automático...');

    try {
      const latestConfig = await this.feeConfigService.getLatestFeeConfig();
      if (!latestConfig) {
        this.logger.error(
          'No se encontró configuración de cuotas. Cancelando proceso.',
        );
        return;
      }

      const lateFeeAmount = latestConfig.lateFee;

      const overdueFees = await this.prisma.fee.findMany({
        where: {
          status: { not: FeeStatus.PAID },
          lateFeeApplied: false,
          dueDate: { lt: new Date() },
        },
      });

      if (overdueFees.length === 0) {
        this.logger.log(
          'No se encontraron nuevas cuotas vencidas para aplicar mora.',
        );
        return;
      }

      this.logger.log(`Se aplicará mora a ${overdueFees.length} cuota(s).`);

      for (const fee of overdueFees) {
        try {
          await this.feesService.applyLateFee(fee.id, lateFeeAmount);
          this.logger.log(
            `Mora de $${lateFeeAmount} aplicada exitosamente a la cuota ID ${fee.id}.`,
          );
        } catch (error: any) {
          this.logger.error(
            `Error al aplicar mora a la cuota ID ${fee.id}: ${error.message}`,
          );
        }
      }

      this.logger.log('Proceso de cobro de mora finalizado.');
    } catch (error: any) {
      this.logger.error(
        `Error general en el proceso de mora: ${error.message}`,
      );
    }
  }
}
