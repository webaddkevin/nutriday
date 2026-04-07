/**
 * 食物 API 封装
 */
import { request } from '@/utils/request';
import type { Food } from '@nutriday/shared-types';

/**
 * 搜索食物（本地数据库）
 */
export async function searchFood(keyword: string, limit = 20): Promise<Food[]> {
  const res = await request<Food[]>({
    url: `/food/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 增强搜索食物（本地 + 外部 API + AI 估算）
 */
export async function enhancedSearchFood(keyword: string): Promise<Food[]> {
  const res = await request<Food[]>({
    url: `/food/search/enhanced?keyword=${encodeURIComponent(keyword)}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 从 USDA 搜索食物
 */
export async function searchFoodFromUSDA(keyword: string, limit = 10): Promise<Food[]> {
  const res = await request<Food[]>({
    url: `/food/search/usda?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 保存外部食物到本地
 */
export async function saveExternalFood(
  food: Partial<Food>,
): Promise<{ id: number; message: string }> {
  const res = await request<{ id: number; message: string }>({
    url: '/food/save-external',
    method: 'POST',
    data: food,
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
