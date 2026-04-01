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
  async saveProfile(dto: SaveProfileDto & { userId: number }) {
    const {
      userId,
      tags,
      nickname,
      avatarUrl,
      allergies,
      diseases,
      medications,
      dietaryRestrictions,
      healthNotes,
      ...rest
    } = dto;

    // 更新用户昵称和头像（如果用户存在）
    if (nickname !== undefined || avatarUrl !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(nickname !== undefined && { nickname }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
      });
    }

    const profile = await this.prisma.userProfile.upsert({
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
        targetWeight: rest.targetWeight ? Number(rest.targetWeight) : null,
        targetDate: rest.targetDate || null,
        weeklyGoal: rest.weeklyGoal ? Number(rest.weeklyGoal) : null,
        targetCalories: rest.targetCalories
          ? Number(rest.targetCalories)
          : null,
        allergies: JSON.stringify(allergies ?? []),
        diseases: JSON.stringify(diseases ?? []),
        medications: JSON.stringify(medications ?? []),
        dietaryRestrictions: JSON.stringify(dietaryRestrictions ?? []),
        healthNotes: healthNotes || null,
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
        targetWeight:
          rest.targetWeight !== undefined
            ? rest.targetWeight
              ? Number(rest.targetWeight)
              : null
            : undefined,
        targetDate:
          rest.targetDate !== undefined ? rest.targetDate || null : undefined,
        weeklyGoal:
          rest.weeklyGoal !== undefined
            ? rest.weeklyGoal
              ? Number(rest.weeklyGoal)
              : null
            : undefined,
        targetCalories:
          rest.targetCalories !== undefined
            ? rest.targetCalories
              ? Number(rest.targetCalories)
              : null
            : undefined,
        allergies:
          allergies !== undefined ? JSON.stringify(allergies ?? []) : undefined,
        diseases:
          diseases !== undefined ? JSON.stringify(diseases ?? []) : undefined,
        medications:
          medications !== undefined
            ? JSON.stringify(medications ?? [])
            : undefined,
        dietaryRestrictions:
          dietaryRestrictions !== undefined
            ? JSON.stringify(dietaryRestrictions ?? [])
            : undefined,
        healthNotes:
          healthNotes !== undefined ? healthNotes || null : undefined,
      },
    });

    // 返回解析后的数据
    return {
      ...profile,
      tags: JSON.parse(profile.tags),
      allergies: JSON.parse(profile.allergies || '[]'),
      diseases: JSON.parse(profile.diseases || '[]'),
      medications: JSON.parse(profile.medications || '[]'),
      dietaryRestrictions: JSON.parse(profile.dietaryRestrictions || '[]'),
    };
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
      allergies: JSON.parse(rest.allergies || '[]'),
      diseases: JSON.parse(rest.diseases || '[]'),
      medications: JSON.parse(rest.medications || '[]'),
      dietaryRestrictions: JSON.parse(rest.dietaryRestrictions || '[]'),
      nickname: user?.nickname || null,
      avatarUrl: user?.avatarUrl || null,
    };
  }

  /**
   * 获取目标进度统计
   */
  async getGoalProgress(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.targetWeight) {
      return null;
    }

    // 获取最新体重
    const latestWeight = await this.prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const currentWeight = latestWeight?.weight || profile.weight;
    const startWeight = profile.weight;
    const targetWeight = profile.targetWeight;

    // 计算进度
    const totalToChange = Math.abs(targetWeight - startWeight);
    const changed = Math.abs(currentWeight - startWeight);
    const progress =
      totalToChange > 0 ? Math.min(changed / totalToChange, 1) : 0;

    // 计算剩余天数
    let daysRemaining = null;
    if (profile.targetDate) {
      const targetDate = new Date(profile.targetDate);
      const today = new Date();
      daysRemaining = Math.max(
        0,
        Math.ceil(
          (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
    }

    // 计算每周需要变化
    let weeklyRequired = null;
    if (daysRemaining !== null && daysRemaining > 0) {
      const weightRemaining = targetWeight - currentWeight;
      weeklyRequired = (weightRemaining / (daysRemaining / 7)).toFixed(2);
    }

    return {
      goal: profile.goal,
      startWeight,
      currentWeight,
      targetWeight,
      progress: Math.round(progress * 100),
      targetDate: profile.targetDate,
      daysRemaining,
      weeklyGoal: profile.weeklyGoal,
      weeklyRequired: weeklyRequired ? Number(weeklyRequired) : null,
      targetCalories: profile.targetCalories,
    };
  }
}
