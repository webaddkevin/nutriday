import { request } from '../utils/request';

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
  userId: number;
  date: string;
  weight: number;
  note?: string;
}): Promise<WeightLog> {
  const res = await request<WeightLog>({
    url: '/weight-log',
    method: 'POST',
    data,
  });
  return res.data;
}

/**
 * 获取某天的体重记录
 */
export async function getWeight(userId: number, date: string): Promise<WeightLog | null> {
  const res = await request<WeightLog | null>({
    url: `/weight-log?userId=${userId}&date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取日期范围内的体重记录
 */
export async function getWeightRange(
  userId: number,
  startDate: string,
  endDate: string,
): Promise<WeightLog[]> {
  const res = await request<WeightLog[]>({
    url: `/weight-log/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取体重趋势统计
 */
export async function getWeightStats(userId: number): Promise<WeightStats> {
  const res = await request<WeightStats>({
    url: `/weight-log/stats?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 删除体重记录
 */
export async function deleteWeight(userId: number, date: string): Promise<void> {
  await request<void>({
    url: `/weight-log?userId=${userId}&date=${date}`,
    method: 'DELETE',
  });
}
