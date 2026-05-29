import { Module } from '@nestjs/common';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { FeesModule } from '../fees/fees.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [FeesModule, CloudinaryModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
