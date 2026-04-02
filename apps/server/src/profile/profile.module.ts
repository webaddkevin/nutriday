import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

/**
 * 用户画像模块
 * PrismaModule 已全局注册，无需再次导入
 */
@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
