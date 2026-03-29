/**
 * AI 推荐 API 封装
 */
import { request } from '@/utils/request';

export interface MealRecommendation {
  name: string;
  foods: { name: string; amount: number; unit: string }[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
}

export interface RecommendationResponse {
  userProfile: {
    goal: string;
    tdee: number | null;
  };
  avgNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recommendations: MealRecommendation[];
  tips: string[];
}

/**
 * 获取餐食推荐
 */
export async function getMealRecommendation(
  userId: number,
  mealType: string,
  targetCalories?: number,
): Promise<RecommendationResponse> {
  const params = new URLSearchParams({
    userId: String(userId),
    mealType,
  });
  if (targetCalories) {
    params.append('targetCalories', String(targetCalories));
  }

  const res = await request<RecommendationResponse>({
    url: `/recommendation/meal?${params.toString()}`,
    method: 'GET',
  });
  return res.data;
}
