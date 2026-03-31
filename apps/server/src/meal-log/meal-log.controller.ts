import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { MealLogService } from './meal-log.service';
import { CreateMealLogDto } from './dto/create-meal-log.dto';
import { AuthService } from '../auth/auth.service';

@Controller('meal-log')
export class MealLogController {
  constructor(
    private readonly mealLogService: MealLogService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 从 header 提取用户 ID
   */
  private async extractUserId(authorization: string): Promise<number> {
    if (!authorization) {
      throw new UnauthorizedException('未提供认证信息');
    }
    const token = authorization.replace('Bearer ', '');
    const userId = await this.authService.validateToken(token);
    if (!userId) {
      throw new UnauthorizedException('无效的认证信息');
    }
    return userId;
  }

  /**
   * 创建饮食记录
   */
  @Post()
  async create(
    @Headers('authorization') authorization: string,
    @Body() dto: CreateMealLogDto,
  ) {
    try {
      const userId = await this.extractUserId(authorization);
      const log = await this.mealLogService.create({ ...dto, userId });
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
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    const logs = await this.mealLogService.findByDate(userId, date);
    return { code: 0, message: '查询成功', data: logs };
  }

  /**
   * 获取某天的营养汇总
   */
  @Get('summary')
  async getDailySummary(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    const summary = await this.mealLogService.getDailySummary(userId, date);
    return { code: 0, message: '查询成功', data: summary };
  }

  /**
   * 获取某天某餐的记录
   */
  @Get('meal')
  async findByMealType(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
    @Query('mealType') mealType: string,
  ) {
    const userId = await this.extractUserId(authorization);
    const logs = await this.mealLogService.findByMealType(
      userId,
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
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = await this.extractUserId(authorization);
    const logs = await this.mealLogService.findByDateRange(
      userId,
      startDate,
      endDate,
    );
    return { code: 0, message: '查询成功', data: logs };
  }

  /**
   * 删除饮食记录
   */
  @Delete(':id')
  async delete(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    try {
      const userId = await this.extractUserId(authorization);
      await this.mealLogService.delete(parseInt(id), userId);
      return { code: 0, message: '删除成功', data: null };
    } catch (error) {
      return { code: 400, message: (error as Error).message, data: null };
    }
  }
}
