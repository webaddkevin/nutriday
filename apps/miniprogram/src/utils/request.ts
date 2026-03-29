/**
 * 统一请求封装
 * 基于 uni.request 封装，提供类型安全的 HTTP 请求方法
 */

/** 服务端基础地址，开发环境使用本地地址 */
const BASE_URL = 'http://localhost:3002';

interface RequestOptions {
  /** 请求路径（不含 baseURL） */
  url: string;
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 请求体数据 */
  data?: Record<string, unknown> | object;
}

interface ApiResult<T = unknown> {
  code?: number;
  message?: string;
  data: T;
  success?: boolean;
}

/**
 * 发起 HTTP 请求
 * @param options 请求选项
 * @returns Promise<ApiResult<T>>
 */
export function request<T = unknown>(options: RequestOptions): Promise<ApiResult<T>> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
      },
      success: (res) => {
        const result = res.data as ApiResult<T>;

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
            uni.showToast({ title: result.message || '请求失败', icon: 'none' });
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
          uni.showToast({ title: result.message || '请求失败', icon: 'none' });
          reject(result);
          return;
        }

        // 其他情况，直接返回
        resolve(result);
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        reject(err);
      },
    });
  });
}
