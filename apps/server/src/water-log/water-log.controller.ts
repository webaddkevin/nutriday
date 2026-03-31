import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { WaterLogService } from './water-log.service';
import { SaveWaterDto } from './dto/water-log.dto';
import { AuthService } from '../auth/auth.service';

/**
 * 饮水记录控制器
 */
@Controller('water-log')
export class WaterLogController {
  constructor(
    private readonly waterLogService: WaterLogService,
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
   * 保存饮水记录
   * POST /water-log
   */
  @Post()
  async saveWater(
    @Headers('authorization') authorization: string,
    @Body() dto: SaveWaterDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.waterLogService.saveWater({ ...dto, userId });
  }

  /**
   * 增加饮水量
   * POST /water-log/add
   */
  @Post('add')
  async addWater(
    @Headers('authorization') authorization: string,
    @Body('date') date: string,
    @Body('amount') amount: number,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.waterLogService.addWater(userId, date, Number(amount));
  }

  /**
   * 获取某天的饮水记录
   * GET /water-log?date=2026-03-29
   */
  @Get()
  async getWater(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.waterLogService.getWater(userId, date);
  }

  /**
   * 获取日期范围内的饮水记录
   * GET /water-log/range?startDate=2026-03-01&endDate=2026-03-29
   */
  @Get('range')
  async getWaterRange(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.waterLogService.getWaterRange(userId, startDate, endDate);
  }

  /**
   * 获取饮水统计
   * GET /water-log/stats
   */
  @Get('stats')
  async getWaterStats(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.waterLogService.getWaterStats(userId);
  }

  /**
   * 删除饮水记录
   * DELETE /water-log?date=2026-03-29
   */
  @Delete()
  async deleteWater(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.waterLogService.deleteWater(userId, date);
  }
}
