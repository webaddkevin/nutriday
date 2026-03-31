import { request } from '../utils/request';

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
  const res = await request<MealPlan[]>({
    url: `/meal-plan?date=${date}`,
    method: 'GET',
  });
  return res.data;
}

export async function getMealPlansByRange(startDate: string, endDate: string): Promise<MealPlan[]> {
  const res = await request<MealPlan[]>({
    url: `/meal-plan/range?startDate=${startDate}&endDate=${endDate}`,
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
  const res = await request<MealPlan>({
    url: '/meal-plan',
    method: 'POST',
    data,
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
  const res = await request<MealPlan>({
    url: `/meal-plan/${id}`,
    method: 'PUT',
    data,
  });
  return res.data;
}

export async function deleteMealPlan(id: number): Promise<void> {
  await request<void>({
    url: `/meal-plan/${id}`,
    method: 'DELETE',
  });
}
