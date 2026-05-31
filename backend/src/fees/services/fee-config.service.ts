import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeeConfigDto } from '../dto/create-fee-config.dto';

@Injectable()
export class FeeConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeeConfig(data: CreateFeeConfigDto) {
    if (data.baseAmount === null || data.baseAmount === undefined || data.baseAmount <= 0) {
      throw new BadRequestException('El monto base de la cuota debe ser mayor a 0.');
    }

    const newValidFrom = new Date(data.validFrom);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newValidFrom < today) {
      throw new BadRequestException('La fecha de vigencia no puede ser anterior a la fecha actual.');
    }

    const latestConfig = await this.prisma.feeConfig.findFirst({
      orderBy: { validFrom: 'desc' },
    });

    if (latestConfig && newValidFrom <= latestConfig.validFrom) {
      throw new BadRequestException('La fecha de vigencia debe ser posterior a la última configuración existente.');
    }

    return this.prisma.feeConfig.create({
      data: {
        baseAmount: data.baseAmount,
        lateFee: data.lateFee,
        validFrom: newValidFrom,
      },
    });
  }

  async getLatestFeeConfig() {
    // Get the most recent config that is valid right now or in the past
    const config = await this.prisma.feeConfig.findFirst({
      orderBy: { validFrom: 'desc' },
      where: {
        validFrom: {
          lte: new Date(),
        },
      },
    });

    if (!config) {
      throw new NotFoundException('No active FeeConfig found. Please create one.');
    }

    return config;
  }

  async getAllConfigs() {
    return this.prisma.feeConfig.findMany({
      orderBy: { validFrom: 'desc' },
    });
  }

  async deleteFeeConfig(id: number) {
    const config = await this.prisma.feeConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Configuración de cuota no encontrada.');
    }

    return this.prisma.feeConfig.delete({
      where: { id },
    });
  }
}
