import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FoodFavoriteService } from './food-favorite.service';
import { AuthService } from '../auth/auth.service';

@Controller('food-favorite')
export class FoodFavoriteController {
  constructor(
    private readonly foodFavoriteService: FoodFavoriteService,
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

  // 添加收藏
  @Post()
  async addFavorite(
    @Headers('authorization') authorization: string,
    @Body('foodId', ParseIntPipe) foodId: number,
    @Body('note') note?: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.foodFavoriteService.addFavorite(userId, foodId, note);
  }

  // 取消收藏
  @Delete()
  async removeFavorite(
    @Headers('authorization') authorization: string,
    @Query('foodId', ParseIntPipe) foodId: number,
  ) {
    const userId = await this.extractUserId(authorization);
    await this.foodFavoriteService.removeFavorite(userId, foodId);
    return { success: true };
  }

  // 获取收藏列表
  @Get()
  async getFavorites(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.foodFavoriteService.getFavorites(userId);
  }

  // 检查是否已收藏
  @Get('check')
  async checkFavorite(
    @Headers('authorization') authorization: string,
    @Query('foodId', ParseIntPipe) foodId: number,
  ) {
    const userId = await this.extractUserId(authorization);
    const isFavorite = await this.foodFavoriteService.isFavorite(
      userId,
      foodId,
    );
    return { isFavorite };
  }

  // 更新备注
  @Post('note')
  async updateNote(
    @Headers('authorization') authorization: string,
    @Body('foodId', ParseIntPipe) foodId: number,
    @Body('note') note: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.foodFavoriteService.updateNote(userId, foodId, note);
  }

  // 批量添加收藏
  @Post('batch')
  async addFavorites(
    @Headers('authorization') authorization: string,
    @Body('foodIds') foodIds: number[],
  ) {
    const userId = await this.extractUserId(authorization);
    return this.foodFavoriteService.addFavorites(userId, foodIds);
  }

  // 批量取消收藏
  @Delete('batch')
  async removeFavorites(
    @Headers('authorization') authorization: string,
    @Query('foodIds') foodIds: string,
  ) {
    const userId = await this.extractUserId(authorization);
    const ids = foodIds.split(',').map(Number);
    return this.foodFavoriteService.removeFavorites(userId, ids);
  }

  // 获取收藏统计
  @Get('stats')
  async getStats(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.foodFavoriteService.getStats(userId);
  }
}
