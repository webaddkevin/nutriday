import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  wechatLogin,
  getCurrentUser,
  updateUserProfile,
  type UserProfile,
  type LoginResult,
} from '@/api/auth-api';
import { getToken, setToken, clearToken, setUserId, getUserId } from '@/utils/request';

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<UserProfile | null>(null);
  const token = ref<string | null>(getToken());
  const loading = ref(false);

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const hasProfile = computed(() => !!user.value?.profile);
  const userId = computed(() => user.value?.id || getUserId());

  /**
   * 登录
   */
  async function login(options?: { nickname?: string; avatarUrl?: string }): Promise<LoginResult> {
    loading.value = true;
    try {
      const result = await wechatLogin(options);
      token.value = result.token;
      user.value = result.user as unknown as UserProfile;
      setToken(result.token);
      setUserId(result.user.id);
      return result;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUser(): Promise<UserProfile> {
    const profile = await getCurrentUser();
    user.value = profile;
    setUserId(profile.id);
    return profile;
  }

  /**
   * 更新用户资料
   */
  async function updateProfile(data: {
    nickname?: string;
    avatarUrl?: string;
    phone?: string;
  }): Promise<UserProfile> {
    const profile = await updateUserProfile(data);
    user.value = profile;
    return profile;
  }

  /**
   * 登出
   */
  function logout() {
    user.value = null;
    token.value = null;
    clearToken();
  }

  /**
   * 检查登录状态，未登录则自动登录
   */
  async function checkLogin(): Promise<boolean> {
    if (token.value && !user.value) {
      try {
        await fetchUser();
        return true;
      } catch {
        // token 无效，尝试重新登录
        logout();
      }
    }

    if (!token.value) {
      try {
        await login();
        return true;
      } catch {
        return false;
      }
    }

    return isLoggedIn.value;
  }

  return {
    // 状态
    user,
    token,
    loading,
    // 计算属性
    isLoggedIn,
    hasProfile,
    userId,
    // 方法
    login,
    fetchUser,
    updateProfile,
    logout,
    checkLogin,
  };
});
