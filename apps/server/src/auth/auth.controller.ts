import { Controller, Post, Get, Put, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WechatLoginDto, UpdateUserProfileDto } from './auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { UserId } from '../common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信小程序登录
   * POST /auth/wechat-login
   */
  @Public()
  @Post('wechat-login')
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto);
  }

  /**
   * 获取当前用户信息
   * GET /auth/me
   */
  @Get('me')
  async getCurrentUser(@UserId() userId: number) {
    return this.authService.getUser(userId);
  }

  /**
   * 更新用户资料
   * PUT /auth/profile
   */
  @Put('profile')
  async updateProfile(
    @UserId() userId: number,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.authService.updateUserProfile(userId, dto);
  }
}
