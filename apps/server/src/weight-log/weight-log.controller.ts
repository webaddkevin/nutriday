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
import { WeightLogService } from './weight-log.service';
import { SaveWeightDto } from './dto/weight-log.dto';
import { AuthService } from '../auth/auth.service';

/**
 * 体重记录控制器
 */
@Controller('weight-log')
export class WeightLogController {
  constructor(
    private readonly weightLogService: WeightLogService,
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
   * 保存体重记录
   * POST /weight-log
   */
  @Post()
  async saveWeight(
    @Headers('authorization') authorization: string,
    @Body() dto: SaveWeightDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.weightLogService.saveWeight({ ...dto, userId });
  }

  /**
   * 获取某天的体重记录
   * GET /weight-log?date=2026-03-29
   */
  @Get()
  async getWeight(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.weightLogService.getWeight(userId, date);
  }

  /**
   * 获取日期范围内的体重记录
   * GET /weight-log/range?startDate=2026-03-01&endDate=2026-03-29
   */
  @Get('range')
  async getWeightRange(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.weightLogService.getWeightRange(userId, startDate, endDate);
  }

  /**
   * 获取体重趋势统计
   * GET /weight-log/stats
   */
  @Get('stats')
  async getWeightStats(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.weightLogService.getWeightStats(userId);
  }

  /**
   * 删除体重记录
   * DELETE /weight-log?date=2026-03-29
   */
  @Delete()
  async deleteWeight(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.weightLogService.deleteWeight(userId, date);
  }
}
