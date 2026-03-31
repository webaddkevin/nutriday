/**
 * 饮食记录 API 封装
 */
import { request } from '@/utils/request';
import { requireUserId } from '@/utils/user';
import type { MealLog, MealType, DailySummary } from '@nutriday/shared-types';

export interface CreateMealLogParams {
  date: string;
  mealType: MealType;
  foodId: number;
  amount: number;
  note?: string;
}

/**
 * 创建饮食记录
 */
export async function createMealLog(params: CreateMealLogParams): Promise<MealLog> {
  const userId = requireUserId();
  const res = await request<MealLog>({
    url: '/meal-log',
    method: 'POST',
    data: { ...params, userId },
  });
  return res.data;
}

/**
 * 获取某天的饮食记录
 */
export async function getMealLogsByDate(date: string): Promise<MealLog[]> {
  const userId = requireUserId();
  const res = await request<MealLog[]>({
    url: `/meal-log/daily?userId=${userId}&date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取某天的营养汇总
 */
export async function getDailySummary(date: string): Promise<DailySummary> {
  const userId = requireUserId();
  const res = await request<DailySummary>({
    url: `/meal-log/summary?userId=${userId}&date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取某天某餐的记录
 */
export async function getMealLogsByType(date: string, mealType: MealType): Promise<MealLog[]> {
  const userId = requireUserId();
  const res = await request<MealLog[]>({
    url: `/meal-log/meal?userId=${userId}&date=${date}&mealType=${mealType}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取日期范围内的记录
 */
export async function getMealLogsByRange(startDate: string, endDate: string): Promise<MealLog[]> {
  const userId = requireUserId();
  const res = await request<MealLog[]>({
    url: `/meal-log/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 删除饮食记录
 */
export async function deleteMealLog(id: number): Promise<void> {
  const userId = requireUserId();
  await request<null>({
    url: `/meal-log/${id}?userId=${userId}`,
    method: 'DELETE',
  });
}
