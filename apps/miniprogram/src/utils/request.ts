/**
 * 统一请求封装
 * 基于 uni.request 封装，提供类型安全的 HTTP 请求方法
 */

/** 服务端基础地址，开发环境使用本地地址 */
const BASE_URL = 'http://localhost:3002';

/** Token 存储 key */
const TOKEN_KEY = 'nutriday_token';
/** 用户 ID 存储 key */
const USER_ID_KEY = 'nutriday_user_id';

/** 是否正在显示登录提示 */
let isShowingLoginModal = false;

interface RequestOptions {
  /** 请求路径（不含 baseURL） */
  url: string;
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 请求体数据 */
  data?: Record<string, unknown> | object;
  /** 是否需要认证 */
  requireAuth?: boolean;
  /** 是否静默模式（不显示错误提示） */
  silent?: boolean;
}

interface ApiResult<T = unknown> {
  code?: number;
  message?: string;
  data: T;
  success?: boolean;
}

/**
 * 获取存储的 token
 */
export function getToken(): string | null {
  return uni.getStorageSync(TOKEN_KEY) || null;
}

/**
 * 保存 token
 */
export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token);
}

/**
 * 清除 token
 */
export function clearToken(): void {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_ID_KEY);
}

/**
 * 获取用户 ID
 */
export function getUserId(): number | null {
  const id = uni.getStorageSync(USER_ID_KEY);
  return id ? parseInt(id, 10) : null;
}

/**
 * 保存用户 ID
 */
export function setUserId(userId: number): void {
  uni.setStorageSync(USER_ID_KEY, userId);
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/**
 * 显示登录提示弹窗
 */
function showLoginModal() {
  if (isShowingLoginModal) return;
  isShowingLoginModal = true;

  uni.showModal({
    title: '需要登录',
    content: '该功能需要登录后才能使用，是否立即登录？',
    confirmText: '去登录',
    cancelText: '稍后再说',
    success: (res) => {
      isShowingLoginModal = false;
      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/login/login',
        });
      }
    },
    fail: () => {
      isShowingLoginModal = false;
    },
  });
}

/**
 * 发起 HTTP 请求
 * @param options 请求选项
 * @returns Promise<ApiResult<T>>
 */
export function request<T = unknown>(options: RequestOptions): Promise<ApiResult<T>> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 添加认证头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        const result = res.data as ApiResult<T>;

        // 处理 401 未认证错误
        if (res.statusCode === 401) {
          clearToken();

          if (!options.silent) {
            showLoginModal();
          }

          reject({ code: 401, message: '未提供认证信息', needLogin: true });
          return;
        }

        // 兼容多种返回格式：
        // 1. { code: 0, data: T } - 标准格式
        // 2. { success: true, data: T } - barcode 等接口格式
        // 3. 直接返回数据 T - 部分接口直接返回数组/对象

        // 格式1: code 存在且为0
        if (result.code === 0) {
          resolve(result);
          return;
        }

        // 格式2: success 存在
        if (result.success !== undefined) {
          if (result.success) {
            resolve(result);
          } else {
            // 检查是否是认证错误
            if (
              result.code === 401 ||
              result.message?.includes('认证') ||
              result.message?.includes('token')
            ) {
              clearToken();
              if (!options.silent) {
                showLoginModal();
              }
              reject({ ...result, needLogin: true });
              return;
            }

            if (!options.silent) {
              uni.showToast({ title: result.message || '请求失败', icon: 'none' });
            }
            reject(result);
          }
          return;
        }

        // 格式3: 直接返回数据（没有 code/success 字段）
        // 检查是否有 code 字段，如果没有，说明是直接返回的数据
        if (result.code === undefined && result.success === undefined) {
          // 直接返回的数据，包装成标准格式
          resolve({ data: result as T });
          return;
        }

        // 格式1但 code 不为0
        if (result.code !== undefined && result.code !== 0) {
          // 检查是否是认证错误
          if (
            result.code === 401 ||
            result.message?.includes('认证') ||
            result.message?.includes('token')
          ) {
            clearToken();
            if (!options.silent) {
              showLoginModal();
            }
            reject({ ...result, needLogin: true });
            return;
          }

          if (!options.silent) {
            uni.showToast({ title: result.message || '请求失败', icon: 'none' });
          }
          reject(result);
          return;
        }

        // 其他情况，直接返回
        resolve(result);
      },
      fail: (err) => {
        if (!options.silent) {
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        }
        reject(err);
      },
    });
  });
}
