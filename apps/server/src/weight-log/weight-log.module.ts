import { Module } from '@nestjs/common';
import { WeightLogController } from './weight-log.controller';
import { WeightLogService } from './weight-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WeightLogController],
  providers: [WeightLogService],
  exports: [WeightLogService],
})
export class WeightLogModule {}
