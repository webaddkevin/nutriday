/**
 * 用户相关工具函数
 */
import { useUserStore } from '@/stores/user';
import { getUserId } from './request';

/**
 * 获取当前用户 ID
 * 优先从 store 获取，其次从本地存储获取
 * @returns 用户 ID，未登录返回 null
 */
export function getCurrentUserId(): number | null {
  try {
    const userStore = useUserStore();
    if (userStore.userId) {
      return userStore.userId;
    }
  } catch {
    // store 未初始化，从本地存储获取
  }
  return getUserId();
}

/**
 * 获取当前用户 ID，未登录抛出错误
 * @returns 用户 ID
 */
export function requireUserId(): number {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('用户未登录');
  }
  return userId;
}
