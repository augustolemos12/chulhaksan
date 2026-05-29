import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeeConfigDto } from '../dto/create-fee-config.dto';

@Injectable()
export class FeeConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeeConfig(data: CreateFeeConfigDto) {
    return this.prisma.feeConfig.create({
      data: {
        baseAmount: data.baseAmount,
        lateFee: data.lateFee,
        validFrom: new Date(data.validFrom),
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
}
