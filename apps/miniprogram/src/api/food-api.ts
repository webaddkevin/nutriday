/**
 * 食物 API 封装
 */
import { request } from '@/utils/request';
import type { Food } from '@nutriday/shared-types';

/**
 * 搜索食物
 */
export async function searchFood(keyword: string, limit = 20): Promise<Food[]> {
  const res = await request<Food[]>({
    url: `/food/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 按分类获取食物
 */
export async function getFoodByCategory(category: string, limit = 50): Promise<Food[]> {
  const res = await request<Food[]>({
    url: `/food/category/${encodeURIComponent(category)}?limit=${limit}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取所有分类
 */
export async function getFoodCategories(): Promise<string[]> {
  const res = await request<string[]>({
    url: '/food/categories',
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取食物详情
 */
export async function getFoodById(id: number): Promise<Food | null> {
  const res = await request<Food | null>({
    url: `/food/${id}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 创建食物
 */
export async function createFood(data: Partial<Food>): Promise<Food> {
  const res = await request<Food>({
    url: '/food',
    method: 'POST',
    data,
  });
  return res.data;
}
