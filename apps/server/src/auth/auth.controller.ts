import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { WechatLoginDto, UpdateUserProfileDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信小程序登录
   * POST /auth/wechat-login
   */
  @Post('wechat-login')
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto);
  }

  /**
   * 获取当前用户信息
   * GET /auth/me
   */
  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.authService.getUser(userId);
  }

  /**
   * 更新用户资料
   * PUT /auth/profile
   */
  @Put('profile')
  async updateProfile(
    @Headers('authorization') authorization: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.authService.updateUserProfile(userId, dto);
  }

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
}
