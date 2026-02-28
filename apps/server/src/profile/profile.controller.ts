import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { SaveProfileDto } from './dto/save-profile.dto';

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
  async saveProfile(@Body() dto: SaveProfileDto) {
    const profile = await this.profileService.saveProfile(dto);
    return { code: 0, message: '保存成功', data: profile };
  }

  /**
   * 获取用户画像
   * GET /profile/:userId
   */
  @Get(':userId')
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    const profile = await this.profileService.getProfile(userId);
    return { code: 0, message: 'ok', data: profile };
  }
}
