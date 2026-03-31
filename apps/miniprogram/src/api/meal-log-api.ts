/**
 * 饮食记录 API 封装
 */
import { request } from '@/utils/request';
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
  const res = await request<MealLog>({
    url: '/meal-log',
    method: 'POST',
    data: params,
  });
  return res.data;
}

/**
 * 获取某天的饮食记录
 */
export async function getMealLogsByDate(date: string): Promise<MealLog[]> {
  const res = await request<MealLog[]>({
    url: `/meal-log/daily?date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取某天的营养汇总
 */
export async function getDailySummary(date: string): Promise<DailySummary> {
  const res = await request<DailySummary>({
    url: `/meal-log/summary?date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取某天某餐的记录
 */
export async function getMealLogsByType(date: string, mealType: MealType): Promise<MealLog[]> {
  const res = await request<MealLog[]>({
    url: `/meal-log/meal?date=${date}&mealType=${mealType}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取日期范围内的记录
 */
export async function getMealLogsByRange(startDate: string, endDate: string): Promise<MealLog[]> {
  const res = await request<MealLog[]>({
    url: `/meal-log/range?startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 删除饮食记录
 */
export async function deleteMealLog(id: number): Promise<void> {
  await request<null>({
    url: `/meal-log/${id}`,
    method: 'DELETE',
  });
}
