import { request } from '../utils/request';
import { requireUserId } from '@/utils/user';

/**
 * 体重记录 API
 */

export interface WeightLog {
  id: number;
  userId: number;
  date: string;
  weight: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeightStats {
  current: number | null;
  lowest: number | null;
  highest: number | null;
  change7d: number | null;
  change30d: number | null;
  logs: WeightLog[];
}

/**
 * 保存体重记录
 */
export async function saveWeight(data: {
  date: string;
  weight: number;
  note?: string;
}): Promise<WeightLog> {
  const userId = requireUserId();
  const res = await request<WeightLog>({
    url: '/weight-log',
    method: 'POST',
    data: { ...data, userId },
  });
  return res.data;
}

/**
 * 获取某天的体重记录
 */
export async function getWeight(date: string): Promise<WeightLog | null> {
  const userId = requireUserId();
  const res = await request<WeightLog | null>({
    url: `/weight-log?userId=${userId}&date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取日期范围内的体重记录
 */
export async function getWeightRange(startDate: string, endDate: string): Promise<WeightLog[]> {
  const userId = requireUserId();
  const res = await request<WeightLog[]>({
    url: `/weight-log/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取体重趋势统计
 */
export async function getWeightStats(): Promise<WeightStats> {
  const userId = requireUserId();
  const res = await request<WeightStats>({
    url: `/weight-log/stats?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 删除体重记录
 */
export async function deleteWeight(date: string): Promise<void> {
  const userId = requireUserId();
  await request<void>({
    url: `/weight-log?userId=${userId}&date=${date}`,
    method: 'DELETE',
  });
}
