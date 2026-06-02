import { Module } from '@nestjs/common';
import { FeesService } from './services/fees.service';
import { FeeConfigService } from './services/fee-config.service';
import { FeeConfigController } from './controllers/fee-config.controller';
import { FeesController } from './controllers/fees.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { FeesCronService } from './services/fees-cron.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [FeeConfigController, FeesController],
  providers: [FeesService, FeeConfigService, FeesCronService],
  exports: [FeesService, FeeConfigService],
})
export class FeesModule {}
