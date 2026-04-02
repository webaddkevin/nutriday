import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { WaterLogService } from './water-log.service';
import { SaveWaterDto } from './dto/water-log.dto';
import { UserId } from '../common/decorators/user.decorator';

/**
 * 饮水记录控制器
 */
@Controller('water-log')
export class WaterLogController {
  constructor(private readonly waterLogService: WaterLogService) {}

  /**
   * 保存饮水记录
   * POST /water-log
   */
  @Post()
  async saveWater(@UserId() userId: number, @Body() dto: SaveWaterDto) {
    return this.waterLogService.saveWater({ ...dto, userId });
  }

  /**
   * 增加饮水量
   * POST /water-log/add
   */
  @Post('add')
  async addWater(
    @UserId() userId: number,
    @Body('date') date: string,
    @Body('amount') amount: number,
  ) {
    return this.waterLogService.addWater(userId, date, Number(amount));
  }

  /**
   * 获取某天的饮水记录
   * GET /water-log?date=2026-03-29
   */
  @Get()
  async getWater(@UserId() userId: number, @Query('date') date: string) {
    return this.waterLogService.getWater(userId, date);
  }

  /**
   * 获取日期范围内的饮水记录
   * GET /water-log/range?startDate=2026-03-01&endDate=2026-03-29
   */
  @Get('range')
  async getWaterRange(
    @UserId() userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.waterLogService.getWaterRange(userId, startDate, endDate);
  }

  /**
   * 获取饮水统计
   * GET /water-log/stats
   */
  @Get('stats')
  async getWaterStats(@UserId() userId: number) {
    return this.waterLogService.getWaterStats(userId);
  }

  /**
   * 删除饮水记录
   * DELETE /water-log?date=2026-03-29
   */
  @Delete()
  async deleteWater(@UserId() userId: number, @Query('date') date: string) {
    return this.waterLogService.deleteWater(userId, date);
  }
}
