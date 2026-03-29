import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * 获取餐食推荐
   */
  @Get('meal')
  async getMealRecommendation(
    @Query('userId') userId: string,
    @Query('mealType') mealType: string,
    @Query('targetCalories') targetCalories?: string,
  ) {
    try {
      const result = await this.recommendationService.getMealRecommendation(
        parseInt(userId),
        mealType,
        targetCalories ? parseInt(targetCalories) : 2000,
      );
      return { code: 0, message: '获取成功', data: result };
    } catch (error) {
      return { code: 400, message: (error as Error).message, data: null };
    }
  }
}
