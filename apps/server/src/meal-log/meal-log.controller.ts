import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { MealLogService } from './meal-log.service';
import { CreateMealLogDto } from './dto/create-meal-log.dto';
import { UserId } from '../common/decorators/user.decorator';

@Controller('meal-log')
export class MealLogController {
  constructor(private readonly mealLogService: MealLogService) {}

  /**
   * 创建饮食记录
   */
  @Post()
  async create(@UserId() userId: number, @Body() dto: CreateMealLogDto) {
    const log = await this.mealLogService.create({ ...dto, userId });
    return log;
  }

  /**
   * 获取某天的饮食记录
   */
  @Get('daily')
  async findByDate(@UserId() userId: number, @Query('date') date: string) {
    return this.mealLogService.findByDate(userId, date);
  }

  /**
   * 获取某天的营养汇总
   */
  @Get('summary')
  async getDailySummary(@UserId() userId: number, @Query('date') date: string) {
    return this.mealLogService.getDailySummary(userId, date);
  }

  /**
   * 获取某天某餐的记录
   */
  @Get('meal')
  async findByMealType(
    @UserId() userId: number,
    @Query('date') date: string,
    @Query('mealType') mealType: string,
  ) {
    return this.mealLogService.findByMealType(userId, date, mealType as any);
  }

  /**
   * 获取日期范围内的记录
   */
  @Get('range')
  async findByDateRange(
    @UserId() userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.mealLogService.findByDateRange(userId, startDate, endDate);
  }

  /**
   * 删除饮食记录
   */
  @Delete(':id')
  async delete(@UserId() userId: number, @Param('id') id: string) {
    await this.mealLogService.delete(parseInt(id), userId);
    return null;
  }
}
