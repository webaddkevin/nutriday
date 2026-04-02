import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { UserId } from '../common/decorators/user.decorator';

/**
 * 统计数据控制器
 * 提供周报、月报等统计数据
 */
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * 获取今日概览
   */
  @Get('today')
  async getTodayStats(@UserId() userId: number) {
    return this.statsService.getTodayStats(userId);
  }

  /**
   * 获取周报
   */
  @Get('weekly')
  async getWeeklyStats(
    @UserId() userId: number,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getWeeklyStats(userId, endDate);
  }

  /**
   * 获取月报
   */
  @Get('monthly')
  async getMonthlyStats(
    @UserId() userId: number,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    return this.statsService.getMonthlyStats(
      userId,
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }

  /**
   * 获取营养趋势
   */
  @Get('trend')
  async getNutritionTrend(
    @UserId() userId: number,
    @Query('days') days?: string,
  ) {
    return this.statsService.getNutritionTrend(
      userId,
      days ? parseInt(days) : 7,
    );
  }
}
