import { Controller, Post, Get, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { SaveProfileDto } from './dto/save-profile.dto';
import { UserId } from '../common/decorators/user.decorator';

/**
 * 用户画像控制器
 * 提供保存和查询用户画像的 REST 接口
 */
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * 保存用户画像（创建或更新）
   * POST /profile
   */
  @Post()
  async saveProfile(@UserId() userId: number, @Body() dto: SaveProfileDto) {
    const profile = await this.profileService.saveProfile({ ...dto, userId });
    return profile;
  }

  /**
   * 获取用户画像
   * GET /profile
   */
  @Get()
  async getProfile(@UserId() userId: number) {
    return this.profileService.getProfile(userId);
  }

  /**
   * 获取目标进度
   * GET /profile/goal-progress
   */
  @Get('goal-progress')
  async getGoalProgress(@UserId() userId: number) {
    return this.profileService.getGoalProgress(userId);
  }
}
