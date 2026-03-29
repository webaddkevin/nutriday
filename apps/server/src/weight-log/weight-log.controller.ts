import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { WeightLogService } from './weight-log.service';
import { SaveWeightDto } from './dto/weight-log.dto';

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
  saveWeight(@Body() dto: SaveWeightDto) {
    return this.weightLogService.saveWeight(dto);
  }

  /**
   * 获取某天的体重记录
   * GET /weight-log?userId=1&date=2026-03-29
   */
  @Get()
  getWeight(@Query('userId') userId: string, @Query('date') date: string) {
    return this.weightLogService.getWeight(Number(userId), date);
  }

  /**
   * 获取日期范围内的体重记录
   * GET /weight-log/range?userId=1&startDate=2026-03-01&endDate=2026-03-29
   */
  @Get('range')
  getWeightRange(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.weightLogService.getWeightRange(
      Number(userId),
      startDate,
      endDate,
    );
  }

  /**
   * 获取体重趋势统计
   * GET /weight-log/stats?userId=1
   */
  @Get('stats')
  getWeightStats(@Query('userId') userId: string) {
    return this.weightLogService.getWeightStats(Number(userId));
  }

  /**
   * 删除体重记录
   * DELETE /weight-log?userId=1&date=2026-03-29
   */
  @Delete()
  deleteWeight(@Query('userId') userId: string, @Query('date') date: string) {
    return this.weightLogService.deleteWeight(Number(userId), date);
  }
}
