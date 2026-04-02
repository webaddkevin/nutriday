import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { UserId } from '../common/decorators/user.decorator';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * 获取餐食推荐
   */
  @Get('meal')
  async getMealRecommendation(
    @UserId() userId: number,
    @Query('mealType') mealType: string,
    @Query('targetCalories') targetCalories?: string,
  ) {
    return this.recommendationService.getMealRecommendation(
      userId,
      mealType,
      targetCalories ? parseInt(targetCalories) : 2000,
    );
  }
}
