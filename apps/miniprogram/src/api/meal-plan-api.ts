import { request } from '../utils/request';
import { requireUserId } from '@/utils/user';

export interface MealPlan {
  id: number;
  userId: number;
  date: string;
  mealType: string;
  dishName: string;
  calories: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getMealPlansByDate(date: string): Promise<MealPlan[]> {
  const userId = requireUserId();
  const res = await request<MealPlan[]>({
    url: `/meal-plan?userId=${userId}&date=${date}`,
    method: 'GET',
  });
  return res.data;
}

export async function getMealPlansByRange(startDate: string, endDate: string): Promise<MealPlan[]> {
  const userId = requireUserId();
  const res = await request<MealPlan[]>({
    url: `/meal-plan/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
  });
  return res.data;
}

export async function createMealPlan(data: {
  date: string;
  mealType: string;
  dishName: string;
  calories?: number;
  note?: string;
}): Promise<MealPlan> {
  const userId = requireUserId();
  const res = await request<MealPlan>({
    url: '/meal-plan',
    method: 'POST',
    data: { ...data, userId },
  });
  return res.data;
}

export async function updateMealPlan(
  id: number,
  data: Partial<{
    mealType: string;
    dishName: string;
    calories: number;
    note: string;
  }>,
): Promise<MealPlan> {
  const userId = requireUserId();
  const res = await request<MealPlan>({
    url: `/meal-plan/${id}?userId=${userId}`,
    method: 'PUT',
    data,
  });
  return res.data;
}

export async function deleteMealPlan(id: number): Promise<void> {
  const userId = requireUserId();
  await request<void>({
    url: `/meal-plan/${id}?userId=${userId}`,
    method: 'DELETE',
  });
}
