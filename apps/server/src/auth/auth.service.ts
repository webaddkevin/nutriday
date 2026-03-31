import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WechatLoginDto, UpdateUserProfileDto } from './auth.dto';

interface WechatSessionResult {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 微信小程序登录
   * @param dto 登录参数
   * @returns 用户信息和 token
   */
  async wechatLogin(dto: WechatLoginDto) {
    // 1. 调用微信接口获取 openid
    const wechatResult = await this.getWechatSession(dto.code);

    if (wechatResult.errcode) {
      throw new Error(`微信登录失败: ${wechatResult.errmsg}`);
    }

    const { openid, unionid } = wechatResult;

    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { openid },
      include: { profile: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openid,
          unionid,
          nickname: dto.nickname,
          avatarUrl: dto.avatarUrl,
        },
        include: { profile: true },
      });
      this.logger.log(`创建新用户: ${user.id}, openid: ${openid}`);
    } else {
      // 更新用户信息（如果有新值）
      if (dto.nickname || dto.avatarUrl) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            nickname: dto.nickname || user.nickname,
            avatarUrl: dto.avatarUrl || user.avatarUrl,
            unionid: unionid || user.unionid,
          },
          include: { profile: true },
        });
      }
    }

    // 3. 生成简单 token（实际项目应使用 JWT）
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        hasProfile: !!user.profile,
      },
      token,
    };
  }

  /**
   * 获取用户信息
   */
  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      profile: user.profile,
    };
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId: number, dto: UpdateUserProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  /**
   * 调用微信 code2Session 接口
   */
  private async getWechatSession(code: string): Promise<WechatSessionResult> {
    const appId = process.env.WECHAT_APPID;
    const appSecret = process.env.WECHAT_SECRET;

    // 如果没有配置微信凭证，使用开发模式
    if (!appId || !appSecret) {
      this.logger.warn('未配置微信凭证，使用开发模式');
      return {
        openid: `dev_openid_${code}`,
        session_key: 'dev_session_key',
      };
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    const response = await fetch(url);
    return response.json();
  }

  /**
   * 生成简单 token
   * 实际项目应使用 JWT
   */
  private generateToken(userId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${userId}_${timestamp}_${random}`;
  }

  /**
   * 验证 token（简化版）
   */
  async validateToken(token: string): Promise<number | null> {
    const parts = token.split('_');
    if (parts.length < 1) return null;

    const userId = parseInt(parts[0], 10);
    if (isNaN(userId)) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? userId : null;
  }
}
