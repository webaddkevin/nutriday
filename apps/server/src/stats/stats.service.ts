import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取今日概览
   */
  async getTodayStats(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    // 获取用户画像
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    // 今日饮食记录
    const mealLogs = await this.prisma.mealLog.findMany({
      where: { userId, date: today },
    });

    // 今日饮水
    const waterLog = await this.prisma.waterLog.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    // 今日体重
    const weightLog = await this.prisma.weightLog.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    // 计算营养汇总
    const nutrition = {
      calories: mealLogs.reduce((sum, log) => sum + log.calories, 0),
      protein: mealLogs.reduce((sum, log) => sum + log.protein, 0),
      carbs: mealLogs.reduce((sum, log) => sum + log.carbs, 0),
      fat: mealLogs.reduce((sum, log) => sum + log.fat, 0),
    };

    // 目标热量
    const targetCalories = profile?.targetCalories || profile?.tdee || 2000;

    return {
      date: today,
      nutrition: {
        ...nutrition,
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein * 10) / 10,
        carbs: Math.round(nutrition.carbs * 10) / 10,
        fat: Math.round(nutrition.fat * 10) / 10,
      },
      target: {
        calories: targetCalories,
        protein: (targetCalories * 0.25) / 4,
        carbs: (targetCalories * 0.5) / 4,
        fat: (targetCalories * 0.25) / 9,
      },
      progress: {
        calories: Math.min(nutrition.calories / targetCalories, 1),
        water: waterLog ? waterLog.amount / 2000 : 0, // 默认目标 2000ml
      },
      water: waterLog?.amount || 0,
      waterTarget: 2000,
      weight: weightLog?.weight || null,
      mealCount: mealLogs.length,
    };
  }

  /**
   * 获取周报
   */
  async getWeeklyStats(userId: number, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const startDate = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // 获取日期范围内的数据
    const [mealLogs, waterLogs, weightLogs] = await Promise.all([
      this.prisma.mealLog.findMany({
        where: { userId, date: { gte: startDate, lte: endDateStr } },
      }),
      this.prisma.waterLog.findMany({
        where: { userId, date: { gte: startDate, lte: endDateStr } },
      }),
      this.prisma.weightLog.findMany({
        where: { userId, date: { gte: startDate, lte: endDateStr } },
        orderBy: { date: 'asc' },
      }),
    ]);

    // 按日期分组
    const dailyStats = this.groupByDate(
      mealLogs,
      waterLogs,
      startDate,
      endDateStr,
    );

    // 计算平均值
    const daysWithMeals = dailyStats.filter((d) => d.calories > 0).length;
    const avgCalories =
      daysWithMeals > 0
        ? dailyStats.reduce((sum, d) => sum + d.calories, 0) / daysWithMeals
        : 0;

    return {
      startDate,
      endDate: endDateStr,
      summary: {
        totalDays: 7,
        loggedDays: daysWithMeals,
        avgCalories: Math.round(avgCalories),
        avgWater: Math.round(
          waterLogs.reduce((sum, w) => sum + w.amount, 0) / 7,
        ),
        weightChange:
          weightLogs.length >= 2
            ? weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight
            : null,
      },
      daily: dailyStats,
      weight: weightLogs,
    };
  }

  /**
   * 获取月报
   */
  async getMonthlyStats(userId: number, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [mealLogs, waterLogs, weightLogs] = await Promise.all([
      this.prisma.mealLog.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      }),
      this.prisma.waterLog.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      }),
      this.prisma.weightLog.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      }),
    ]);

    // 按周分组
    const weeks = this.groupByWeeks(mealLogs, waterLogs, startDate, endDate);

    return {
      year,
      month,
      summary: {
        totalDays: new Date(year, month, 0).getDate(),
        loggedDays: new Set(mealLogs.map((m) => m.date)).size,
        totalCalories: Math.round(
          mealLogs.reduce((sum, m) => sum + m.calories, 0),
        ),
        avgCalories: Math.round(
          mealLogs.reduce((sum, m) => sum + m.calories, 0) /
            new Set(mealLogs.map((m) => m.date)).size || 0,
        ),
        totalWater: waterLogs.reduce((sum, w) => sum + w.amount, 0),
        weightChange:
          weightLogs.length >= 2
            ? weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight
            : null,
      },
      weeks,
    };
  }

  /**
   * 获取营养趋势
   */
  async getNutritionTrend(userId: number, days: number) {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    const mealLogs = await this.prisma.mealLog.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });

    // 按日期分组
    const trend: Record<
      string,
      { calories: number; protein: number; carbs: number; fat: number }
    > = {};

    for (const log of mealLogs) {
      if (!trend[log.date]) {
        trend[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      trend[log.date].calories += log.calories;
      trend[log.date].protein += log.protein;
      trend[log.date].carbs += log.carbs;
      trend[log.date].fat += log.fat;
    }

    // 转换为数组并填充空缺日期
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const data = trend[dateStr] || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      result.push({
        date: dateStr,
        calories: Math.round(data.calories),
        protein: Math.round(data.protein * 10) / 10,
        carbs: Math.round(data.carbs * 10) / 10,
        fat: Math.round(data.fat * 10) / 10,
      });
    }

    return result;
  }

  /**
   * 获取用户统计数据（用于成就系统）
   */
  async getUserStats(userId: number) {
    // 获取所有饮食记录
    const mealLogs = await this.prisma.mealLog.findMany({
      where: { userId },
      select: { date: true, foodId: true },
    });

    // 获取所有饮水记录
    const waterLogs = await this.prisma.waterLog.findMany({
      where: { userId },
      select: { date: true, amount: true },
    });

    // 获取所有体重记录
    const weightLogs = await this.prisma.weightLog.findMany({
      where: { userId },
      select: { date: true },
    });

    // 获取用户目标
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { targetCalories: true, tdee: true },
    });
    const targetCalories = profile?.targetCalories || profile?.tdee || 2000;

    // 计算总天数
    const uniqueDates = new Set(mealLogs.map((m) => m.date));
    const totalDays = uniqueDates.size;

    // 计算连续天数
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    let consecutiveDays = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (sortedDates[i] === expectedDateStr) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    // 计算总餐数
    const totalMeals = mealLogs.length;

    // 计算不同食物数
    const uniqueFoods = new Set(mealLogs.map((m) => m.foodId).filter(Boolean));
    const totalFoods = uniqueFoods.size;

    // 计算达成饮水目标的天数
    const waterGoalDays = waterLogs.filter((w) => w.amount >= 2000).length;

    // 计算达成热量目标的天数（需要重新查询带热量数据）
    const mealLogsWithCalories = await this.prisma.mealLog.findMany({
      where: { userId },
      select: { date: true, calories: true },
    });

    const dailyCalories: Record<string, number> = {};
    for (const log of mealLogsWithCalories) {
      if (!dailyCalories[log.date]) dailyCalories[log.date] = 0;
      dailyCalories[log.date] += log.calories;
    }

    const calorieGoalDays = Object.values(dailyCalories).filter(
      (cal) => cal >= targetCalories * 0.9 && cal <= targetCalories * 1.1,
    ).length;

    return {
      totalDays,
      consecutiveDays,
      totalMeals,
      totalFoods,
      waterGoalDays,
      calorieGoalDays,
      weightLogs: weightLogs.length,
    };
  }

  /**
   * 按日期分组
   */
  private groupByDate(
    mealLogs: any[],
    waterLogs: any[],
    startDate: string,
    endDate: string,
  ) {
    const result: any[] = [];
    const waterMap = new Map(waterLogs.map((w) => [w.date, w.amount]));

    // 生成日期范围
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMeals = mealLogs.filter((m) => m.date === dateStr);

      result.push({
        date: dateStr,
        calories: Math.round(dayMeals.reduce((sum, m) => sum + m.calories, 0)),
        protein:
          Math.round(dayMeals.reduce((sum, m) => sum + m.protein, 0) * 10) / 10,
        carbs:
          Math.round(dayMeals.reduce((sum, m) => sum + m.carbs, 0) * 10) / 10,
        fat: Math.round(dayMeals.reduce((sum, m) => sum + m.fat, 0) * 10) / 10,
        water: waterMap.get(dateStr) || 0,
        mealCount: dayMeals.length,
      });
    }

    return result;
  }

  /**
   * 按周分组
   */
  private groupByWeeks(
    mealLogs: any[],
    waterLogs: any[],
    startDate: string,
    endDate: string,
  ) {
    const weeks: any[] = [];
    const waterMap = new Map(waterLogs.map((w) => [w.date, w.amount]));

    const start = new Date(startDate);
    const end = new Date(endDate);

    const weekStart = new Date(start);
    let weekNum = 1;

    while (weekStart <= end) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > end) weekEnd.setTime(end.getTime());

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weekMeals = mealLogs.filter(
        (m) => m.date >= weekStartStr && m.date <= weekEndStr,
      );

      weeks.push({
        week: weekNum,
        startDate: weekStartStr,
        endDate: weekEndStr,
        calories: Math.round(weekMeals.reduce((sum, m) => sum + m.calories, 0)),
        water: Array.from(waterMap.entries())
          .filter(([date]) => date >= weekStartStr && date <= weekEndStr)
          .reduce((sum, [, amount]) => sum + amount, 0),
        mealCount: weekMeals.length,
      });

      weekStart.setDate(weekStart.getDate() + 7);
      weekNum++;
    }

    return weeks;
  }
}
