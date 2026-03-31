import { request } from '../utils/request';

/**
 * 饮水记录 API
 */

export interface WaterLog {
  id: number;
  userId: number;
  date: string;
  amount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaterStats {
  today: number;
  average7d: number;
  average30d: number;
  total7d: number;
  total30d: number;
  logs: WaterLog[];
}

/**
 * 保存饮水记录
 */
export async function saveWater(data: {
  date: string;
  amount: number;
  note?: string;
}): Promise<WaterLog> {
  const res = await request<WaterLog>({
    url: '/water-log',
    method: 'POST',
    data,
  });
  return res.data;
}

/**
 * 增加饮水量
 */
export async function addWater(date: string, amount: number): Promise<WaterLog> {
  const res = await request<WaterLog>({
    url: '/water-log/add',
    method: 'POST',
    data: { date, amount },
  });
  return res.data;
}

/**
 * 获取某天的饮水记录
 */
export async function getWater(date: string): Promise<WaterLog | null> {
  const res = await request<WaterLog | null>({
    url: `/water-log?date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取饮水统计
 */
export async function getWaterStats(): Promise<WaterStats> {
  const res = await request<WaterStats>({
    url: '/water-log/stats',
    method: 'GET',
  });
  return res.data;
}

/**
 * 删除饮水记录
 */
export async function deleteWater(date: string): Promise<void> {
  await request<void>({
    url: `/water-log?date=${date}`,
    method: 'DELETE',
  });
}
