import { Module } from '@nestjs/common';
import { WaterLogController } from './water-log.controller';
import { WaterLogService } from './water-log.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WaterLogController],
  providers: [WaterLogService],
  exports: [WaterLogService],
})
export class WaterLogModule {}
