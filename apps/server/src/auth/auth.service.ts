import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { WechatLoginDto, UpdateUserProfileDto } from './auth.dto';

interface WechatSessionResult {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface JwtPayload {
  sub: number; // userId
  openid: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

    const { openid, unionid, session_key } = wechatResult;

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

    // 3. 生成 JWT token
    const payload: JwtPayload = {
      sub: user.id,
      openid: user.openid,
    };
    const token = this.jwtService.sign(payload);

    // 4. 存储 session_key（用于后续微信接口调用，如解密手机号）
    // 实际项目应存入 Redis，这里简化存入数据库
    await this.prisma.user.update({
      where: { id: user.id },
      data: { sessionKey: session_key },
    });

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
      // 开发模式：始终使用固定的 openid，确保同一用户
      // 这样可以保证开发环境下数据一致性
      return {
        openid: 'dev_openid_default',
        session_key: 'dev_session_key',
      };
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    const response = await fetch(url);
    return response.json();
  }

  /**
   * 验证 JWT token
   */
  async validateToken(token: string): Promise<number | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.sub;

      // 验证用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      return user ? userId : null;
    } catch {
      // JWT 验证失败（过期、签名错误等）
      return null;
    }
  }

  /**
   * 刷新 token
   */
  async refreshToken(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const payload: JwtPayload = {
      sub: user.id,
      openid: user.openid,
    };

    return this.jwtService.sign(payload);
  }
}
