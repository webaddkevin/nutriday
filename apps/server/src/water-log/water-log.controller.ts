import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { WaterLogService } from './water-log.service';
import { SaveWaterDto } from './dto/water-log.dto';

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
  saveWater(@Body() dto: SaveWaterDto) {
    return this.waterLogService.saveWater(dto);
  }

  /**
   * 增加饮水量
   * POST /water-log/add
   */
  @Post('add')
  addWater(
    @Body('userId') userId: number,
    @Body('date') date: string,
    @Body('amount') amount: number,
  ) {
    return this.waterLogService.addWater(Number(userId), date, Number(amount));
  }

  /**
   * 获取某天的饮水记录
   * GET /water-log?userId=1&date=2026-03-29
   */
  @Get()
  getWater(@Query('userId') userId: string, @Query('date') date: string) {
    return this.waterLogService.getWater(Number(userId), date);
  }

  /**
   * 获取日期范围内的饮水记录
   * GET /water-log/range?userId=1&startDate=2026-03-01&endDate=2026-03-29
   */
  @Get('range')
  getWaterRange(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.waterLogService.getWaterRange(
      Number(userId),
      startDate,
      endDate,
    );
  }

  /**
   * 获取饮水统计
   * GET /water-log/stats?userId=1
   */
  @Get('stats')
  getWaterStats(@Query('userId') userId: string) {
    return this.waterLogService.getWaterStats(Number(userId));
  }

  /**
   * 删除饮水记录
   * DELETE /water-log?userId=1&date=2026-03-29
   */
  @Delete()
  deleteWater(@Query('userId') userId: string, @Query('date') date: string) {
    return this.waterLogService.deleteWater(Number(userId), date);
  }
}
