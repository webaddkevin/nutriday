import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealLogDto, MealType } from './dto/create-meal-log.dto';
import { FoodService } from '../food/food.service';

@Injectable()
export class MealLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodService: FoodService,
  ) {}

  /**
   * 创建饮食记录
   */
  async create(dto: CreateMealLogDto) {
    // 获取食物信息
    const food = await this.foodService.findById(dto.foodId);
    if (!food) {
      throw new Error('食物不存在');
    }

    // 计算实际营养摄入
    const ratio = dto.amount / 100;
    const calories = Math.round(food.calories * ratio);
    const protein = Math.round(food.protein * ratio * 10) / 10;
    const carbs = Math.round(food.carbs * ratio * 10) / 10;
    const fat = Math.round(food.fat * ratio * 10) / 10;

    return this.prisma.mealLog.create({
      data: {
        userId: dto.userId,
        date: dto.date,
        mealType: dto.mealType,
        foodId: dto.foodId,
        foodName: food.name,
        amount: dto.amount,
        calories,
        protein,
        carbs,
        fat,
        note: dto.note,
      },
    });
  }

  /**
   * 获取某天的饮食记录
   */
  async findByDate(userId: number, date: string) {
    return this.prisma.mealLog.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 获取某天某餐的饮食记录
   */
  async findByMealType(userId: number, date: string, mealType: MealType) {
    return this.prisma.mealLog.findMany({
      where: { userId, date, mealType },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 获取某天的营养汇总
   */
  async getDailySummary(userId: number, date: string) {
    const logs = await this.findByDate(userId, date);

    const summary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meals: {
        breakfast: { calories: 0, items: [] as typeof logs },
        lunch: { calories: 0, items: [] as typeof logs },
        dinner: { calories: 0, items: [] as typeof logs },
        snack: { calories: 0, items: [] as typeof logs },
      },
    };

    for (const log of logs) {
      summary.calories += log.calories;
      summary.protein += log.protein;
      summary.carbs += log.carbs;
      summary.fat += log.fat;

      const mealKey = log.mealType as keyof typeof summary.meals;
      if (summary.meals[mealKey]) {
        summary.meals[mealKey].calories += log.calories;
        summary.meals[mealKey].items.push(log);
      }
    }

    // 四舍五入
    summary.calories = Math.round(summary.calories);
    summary.protein = Math.round(summary.protein * 10) / 10;
    summary.carbs = Math.round(summary.carbs * 10) / 10;
    summary.fat = Math.round(summary.fat * 10) / 10;

    return summary;
  }

  /**
   * 删除饮食记录
   */
  async delete(id: number, userId: number) {
    const log = await this.prisma.mealLog.findFirst({
      where: { id, userId },
    });

    if (!log) {
      throw new Error('记录不存在');
    }

    return this.prisma.mealLog.delete({
      where: { id },
    });
  }

  /**
   * 获取日期范围内的饮食记录
   */
  async findByDateRange(userId: number, startDate: string, endDate: string) {
    return this.prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
