import { Module } from '@nestjs/common';
import { WeightLogController } from './weight-log.controller';
import { WeightLogService } from './weight-log.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WeightLogController],
  providers: [WeightLogService],
  exports: [WeightLogService],
})
export class WeightLogModule {}
