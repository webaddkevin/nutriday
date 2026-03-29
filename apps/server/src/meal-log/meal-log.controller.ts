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

@Controller('meal-log')
export class MealLogController {
  constructor(private readonly mealLogService: MealLogService) {}

  /**
   * 创建饮食记录
   */
  @Post()
  async create(@Body() dto: CreateMealLogDto) {
    try {
      const log = await this.mealLogService.create(dto);
      return { code: 0, message: '记录成功', data: log };
    } catch (error) {
      return { code: 400, message: (error as Error).message, data: null };
    }
  }

  /**
   * 获取某天的饮食记录
   */
  @Get('daily')
  async findByDate(
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    const logs = await this.mealLogService.findByDate(parseInt(userId), date);
    return { code: 0, message: '查询成功', data: logs };
  }

  /**
   * 获取某天的营养汇总
   */
  @Get('summary')
  async getDailySummary(
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    const summary = await this.mealLogService.getDailySummary(
      parseInt(userId),
      date,
    );
    return { code: 0, message: '查询成功', data: summary };
  }

  /**
   * 获取某天某餐的记录
   */
  @Get('meal')
  async findByMealType(
    @Query('userId') userId: string,
    @Query('date') date: string,
    @Query('mealType') mealType: string,
  ) {
    const logs = await this.mealLogService.findByMealType(
      parseInt(userId),
      date,
      mealType as any,
    );
    return { code: 0, message: '查询成功', data: logs };
  }

  /**
   * 获取日期范围内的记录
   */
  @Get('range')
  async findByDateRange(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const logs = await this.mealLogService.findByDateRange(
      parseInt(userId),
      startDate,
      endDate,
    );
    return { code: 0, message: '查询成功', data: logs };
  }

  /**
   * 删除饮食记录
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    try {
      await this.mealLogService.delete(parseInt(id), parseInt(userId));
      return { code: 0, message: '删除成功', data: null };
    } catch (error) {
      return { code: 400, message: (error as Error).message, data: null };
    }
  }
}
