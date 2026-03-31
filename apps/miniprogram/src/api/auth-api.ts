/**
 * 认证 API 封装
 */
import { request } from '@/utils/request';

export interface LoginResult {
  user: {
    id: number;
    openid: string;
    nickname: string | null;
    avatarUrl: string | null;
    phone: string | null;
    hasProfile: boolean;
  };
  token: string;
}

export interface UserProfile {
  id: number;
  openid: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  profile: unknown;
}

/**
 * 微信登录
 */
export async function wechatLogin(options?: {
  nickname?: string;
  avatarUrl?: string;
}): Promise<LoginResult> {
  // 获取微信登录 code
  const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      success: resolve,
      fail: reject,
    });
  });

  const res = await request<LoginResult>({
    url: '/auth/wechat-login',
    method: 'POST',
    data: {
      code: loginResult.code,
      nickname: options?.nickname,
      avatarUrl: options?.avatarUrl,
    },
  });

  return res.data;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const res = await request<UserProfile>({
    url: '/auth/me',
    method: 'GET',
  });
  return res.data;
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(data: {
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
}): Promise<UserProfile> {
  const res = await request<UserProfile>({
    url: '/auth/profile',
    method: 'PUT',
    data,
  });
  return res.data;
}
