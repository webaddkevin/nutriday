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
  code: number;
  message: string;
  data: T;
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
        if (result.code === 0) {
          resolve(result);
        } else {
          uni.showToast({ title: result.message || '请求失败', icon: 'none' });
          reject(result);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        reject(err);
      },
    });
  });
}
