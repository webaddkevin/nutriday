import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { SaveProfileDto } from './dto/save-profile.dto';
import { AuthService } from '../auth/auth.service';

/**
 * 用户画像控制器
 * 提供保存和查询用户画像的 REST 接口
 */
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 从 header 提取用户 ID
   */
  private async extractUserId(authorization: string): Promise<number> {
    if (!authorization) {
      throw new UnauthorizedException('未提供认证信息');
    }
    const token = authorization.replace('Bearer ', '');
    const userId = await this.authService.validateToken(token);
    if (!userId) {
      throw new UnauthorizedException('无效的认证信息');
    }
    return userId;
  }

  /**
   * 保存用户画像（创建或更新）
   * POST /profile
   */
  @Post()
  async saveProfile(
    @Headers('authorization') authorization: string,
    @Body() dto: SaveProfileDto,
  ) {
    const userId = await this.extractUserId(authorization);
    const profile = await this.profileService.saveProfile({ ...dto, userId });
    return { code: 0, message: '保存成功', data: profile };
  }

  /**
   * 获取用户画像
   * GET /profile
   */
  @Get()
  async getProfile(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    const profile = await this.profileService.getProfile(userId);
    return { code: 0, message: 'ok', data: profile };
  }

  /**
   * 获取目标进度
   * GET /profile/goal-progress
   */
  @Get('goal-progress')
  async getGoalProgress(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    const progress = await this.profileService.getGoalProgress(userId);
    return { code: 0, message: 'ok', data: progress };
  }
}
