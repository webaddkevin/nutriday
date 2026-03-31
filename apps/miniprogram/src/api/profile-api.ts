/**
 * 用户画像 API 封装
 * 提供获取和保存用户画像的统一接口
 */
import { request } from '@/utils/request';
import type { UserProfile, GoalProgress } from '@nutriday/shared-types';

/** 后端返回的用户画像数据（包含数据库字段） */
export interface ProfileResponse extends UserProfile {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取当前用户画像
 * @returns 用户画像数据，不存在时返回 null
 */
export async function getProfile(): Promise<ProfileResponse | null> {
  const res = await request<ProfileResponse | null>({
    url: '/profile',
    method: 'GET',
  });
  return res.data;
}

/** 保存画像请求参数 */
export interface SaveProfileParams {
  gender: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  tags: string[];
  activityLevel: number;
  bmr?: number;
  tdee?: number;
  nickname?: string;
  avatarUrl?: string;
  targetWeight?: number;
  targetDate?: string;
  weeklyGoal?: number;
  targetCalories?: number;
  allergies?: string[];
  diseases?: string[];
  medications?: string[];
  dietaryRestrictions?: string[];
  healthNotes?: string;
}

/**
 * 保存用户画像（创建或更新）
 * @param data 用户画像数据
 */
export async function saveProfile(data: SaveProfileParams): Promise<ProfileResponse> {
  const res = await request<ProfileResponse>({
    url: '/profile',
    method: 'POST',
    data,
  });
  return res.data;
}

/**
 * 获取目标进度
 */
export async function getGoalProgress(): Promise<GoalProgress | null> {
  const res = await request<GoalProgress | null>({
    url: '/profile/goal-progress',
    method: 'GET',
  });
  return res.data;
}
