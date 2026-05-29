import { Module } from '@nestjs/common';
import { FeesService } from './services/fees.service';
import { FeeConfigService } from './services/fee-config.service';
import { FeeConfigController } from './controllers/fee-config.controller';
import { FeesController } from './controllers/fees.controller';

@Module({
  controllers: [FeeConfigController, FeesController],
  providers: [FeesService, FeeConfigService],
  exports: [FeesService, FeeConfigService],
})
export class FeesModule {}
