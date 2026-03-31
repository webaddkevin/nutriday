import { request } from '../utils/request';
import { requireUserId } from '@/utils/user';

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
  const userId = requireUserId();
  const res = await request<WaterLog>({
    url: '/water-log',
    method: 'POST',
    data: { ...data, userId },
  });
  return res.data;
}

/**
 * 增加饮水量
 */
export async function addWater(date: string, amount: number): Promise<WaterLog> {
  const userId = requireUserId();
  const res = await request<WaterLog>({
    url: '/water-log/add',
    method: 'POST',
    data: { userId, date, amount },
  });
  return res.data;
}

/**
 * 获取某天的饮水记录
 */
export async function getWater(date: string): Promise<WaterLog | null> {
  const userId = requireUserId();
  const res = await request<WaterLog | null>({
    url: `/water-log?userId=${userId}&date=${date}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 获取饮水统计
 */
export async function getWaterStats(): Promise<WaterStats> {
  const userId = requireUserId();
  const res = await request<WaterStats>({
    url: `/water-log/stats?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

/**
 * 删除饮水记录
 */
export async function deleteWater(date: string): Promise<void> {
  const userId = requireUserId();
  await request<void>({
    url: `/water-log?userId=${userId}&date=${date}`,
    method: 'DELETE',
  });
}
