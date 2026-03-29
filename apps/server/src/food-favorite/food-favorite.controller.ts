import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FoodFavoriteService } from './food-favorite.service';

@Controller('food-favorite')
export class FoodFavoriteController {
  constructor(private readonly foodFavoriteService: FoodFavoriteService) {}

  // 添加收藏
  @Post()
  async addFavorite(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('foodId', ParseIntPipe) foodId: number,
    @Body('note') note?: string,
  ) {
    return this.foodFavoriteService.addFavorite(userId, foodId, note);
  }

  // 取消收藏
  @Delete()
  async removeFavorite(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('foodId', ParseIntPipe) foodId: number,
  ) {
    await this.foodFavoriteService.removeFavorite(userId, foodId);
    return { success: true };
  }

  // 获取收藏列表
  @Get()
  async getFavorites(@Query('userId', ParseIntPipe) userId: number) {
    return this.foodFavoriteService.getFavorites(userId);
  }

  // 检查是否已收藏
  @Get('check')
  async checkFavorite(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('foodId', ParseIntPipe) foodId: number,
  ) {
    const isFavorite = await this.foodFavoriteService.isFavorite(
      userId,
      foodId,
    );
    return { isFavorite };
  }

  // 更新备注
  @Post('note')
  async updateNote(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('foodId', ParseIntPipe) foodId: number,
    @Body('note') note: string,
  ) {
    return this.foodFavoriteService.updateNote(userId, foodId, note);
  }

  // 批量添加收藏
  @Post('batch')
  async addFavorites(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('foodIds') foodIds: number[],
  ) {
    return this.foodFavoriteService.addFavorites(userId, foodIds);
  }

  // 批量取消收藏
  @Delete('batch')
  async removeFavorites(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('foodIds') foodIds: string,
  ) {
    const ids = foodIds.split(',').map(Number);
    return this.foodFavoriteService.removeFavorites(userId, ids);
  }

  // 获取收藏统计
  @Get('stats')
  async getStats(@Query('userId', ParseIntPipe) userId: number) {
    return this.foodFavoriteService.getStats(userId);
  }
}
