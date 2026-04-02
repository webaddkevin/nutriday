import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { WeightLogService } from './weight-log.service';
import { SaveWeightDto } from './dto/weight-log.dto';
import { UserId } from '../common/decorators/user.decorator';

/**
 * 体重记录控制器
 */
@Controller('weight-log')
export class WeightLogController {
  constructor(private readonly weightLogService: WeightLogService) {}

  /**
   * 保存体重记录
   * POST /weight-log
   */
  @Post()
  async saveWeight(@UserId() userId: number, @Body() dto: SaveWeightDto) {
    return this.weightLogService.saveWeight({ ...dto, userId });
  }

  /**
   * 获取某天的体重记录
   * GET /weight-log?date=2026-03-29
   */
  @Get()
  async getWeight(@UserId() userId: number, @Query('date') date: string) {
    return this.weightLogService.getWeight(userId, date);
  }

  /**
   * 获取日期范围内的体重记录
   * GET /weight-log/range?startDate=2026-03-01&endDate=2026-03-29
   */
  @Get('range')
  async getWeightRange(
    @UserId() userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.weightLogService.getWeightRange(userId, startDate, endDate);
  }

  /**
   * 获取体重趋势统计
   * GET /weight-log/stats
   */
  @Get('stats')
  async getWeightStats(@UserId() userId: number) {
    return this.weightLogService.getWeightStats(userId);
  }

  /**
   * 删除体重记录
   * DELETE /weight-log?date=2026-03-29
   */
  @Delete()
  async deleteWeight(@UserId() userId: number, @Query('date') date: string) {
    return this.weightLogService.deleteWeight(userId, date);
  }
}
