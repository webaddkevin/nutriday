import {
  Controller,
  Get,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { AuthService } from '../auth/auth.service';

@Controller('recommendation')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
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
   * 获取餐食推荐
   */
  @Get('meal')
  async getMealRecommendation(
    @Headers('authorization') authorization: string,
    @Query('mealType') mealType: string,
    @Query('targetCalories') targetCalories?: string,
  ) {
    try {
      const userId = await this.extractUserId(authorization);
      const result = await this.recommendationService.getMealRecommendation(
        userId,
        mealType,
        targetCalories ? parseInt(targetCalories) : 2000,
      );
      return { code: 0, message: '获取成功', data: result };
    } catch (error) {
      return { code: 400, message: (error as Error).message, data: null };
    }
  }
}
