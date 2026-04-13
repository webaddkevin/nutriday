import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoodFavorite } from '@prisma/client';

@Injectable()
export class FoodFavoriteService {
  constructor(private prisma: PrismaService) {}

  // 添加收藏
  async addFavorite(
    userId: number,
    foodId: number,
    note?: string,
  ): Promise<FoodFavorite> {
    return this.prisma.foodFavorite.upsert({
      where: {
        userId_foodId: { userId, foodId },
      },
      update: { note },
      create: { userId, foodId, note },
      include: {
        food: true,
      },
    });
  }

  // 取消收藏
  async removeFavorite(userId: number, foodId: number): Promise<void> {
    const favorite = await this.prisma.foodFavorite.findUnique({
      where: {
        userId_foodId: { userId, foodId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('收藏不存在');
    }

    await this.prisma.foodFavorite.delete({
      where: {
        userId_foodId: { userId, foodId },
      },
    });
  }

  // 获取用户收藏列表
  async getFavorites(userId: number): Promise<FoodFavorite[]> {
    return this.prisma.foodFavorite.findMany({
      where: { userId },
      include: {
        food: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 检查是否已收藏
  async isFavorite(userId: number, foodId: number): Promise<boolean> {
    const favorite = await this.prisma.foodFavorite.findUnique({
      where: {
        userId_foodId: { userId, foodId },
      },
    });
    return !!favorite;
  }

  // 更新收藏备注
  async updateNote(
    userId: number,
    foodId: number,
    note: string,
  ): Promise<FoodFavorite> {
    return this.prisma.foodFavorite.update({
      where: {
        userId_foodId: { userId, foodId },
      },
      data: { note },
      include: {
        food: true,
      },
    });
  }

  // 批量添加收藏
  async addFavorites(
    userId: number,
    foodIds: number[],
  ): Promise<{ count: number }> {
    let count = 0;
    for (const foodId of foodIds) {
      try {
        await this.prisma.foodFavorite.create({
          data: { userId, foodId },
        });
        count++;
      } catch {
        // 已存在，跳过
      }
    }
    return { count };
  }

  // 批量取消收藏
  async removeFavorites(
    userId: number,
    foodIds: number[],
  ): Promise<{ count: number }> {
    const result = await this.prisma.foodFavorite.deleteMany({
      where: {
        userId,
        foodId: { in: foodIds },
      },
    });

    return { count: result.count };
  }

  // 获取收藏统计
  async getStats(userId: number): Promise<{ total: number }> {
    const total = await this.prisma.foodFavorite.count({
      where: { userId },
    });
    return { total };
  }
}
