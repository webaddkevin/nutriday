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
  mealType: string,
  targetCalories?: number,
): Promise<RecommendationResponse> {
  // 小程序环境不支持 URLSearchParams，手动拼接
  let query = `mealType=${encodeURIComponent(mealType)}`;
  if (targetCalories) {
    query += `&targetCalories=${targetCalories}`;
  }

  const res = await request<RecommendationResponse>({
    url: `/recommendation/meal?${query}`,
    method: 'GET',
  });
  return res.data;
}
