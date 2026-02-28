import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveProfileDto } from './dto/save-profile.dto';

/**
 * 用户画像服务
 * 负责用户画像的创建、更新和查询
 */
@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存用户画像（存在则更新，不存在则创建）
   */
  async saveProfile(dto: SaveProfileDto) {
    const { userId, tags, nickname, avatarUrl, ...rest } = dto;

    // 确保用户记录存在，并保存昵称和头像
    await this.prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: `user_${userId}@nutriday.app`,
        nickname: nickname || null,
        avatarUrl: avatarUrl || null,
      },
      update: {
        ...(nickname !== undefined && { nickname }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        gender: rest.gender,
        age: Number(rest.age),
        height: Number(rest.height),
        weight: Number(rest.weight),
        goal: rest.goal,
        activityLevel: Number(rest.activityLevel),
        bmr: rest.bmr ? Number(rest.bmr) : null,
        tdee: rest.tdee ? Number(rest.tdee) : null,
        tags: JSON.stringify(tags ?? []),
      },
      update: {
        gender: rest.gender,
        age: Number(rest.age),
        height: Number(rest.height),
        weight: Number(rest.weight),
        goal: rest.goal,
        activityLevel: Number(rest.activityLevel),
        bmr: rest.bmr ? Number(rest.bmr) : null,
        tdee: rest.tdee ? Number(rest.tdee) : null,
        tags: JSON.stringify(tags ?? []),
      },
    });
  }

  /**
   * 根据用户 ID 获取画像（包含用户昵称和头像）
   */
  async getProfile(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: { user: { select: { nickname: true, avatarUrl: true } } },
    });

    if (!profile) return null;

    const { user, ...rest } = profile;
    return {
      ...rest,
      tags: JSON.parse(rest.tags),
      nickname: user?.nickname || null,
      avatarUrl: user?.avatarUrl || null,
    };
  }
}
