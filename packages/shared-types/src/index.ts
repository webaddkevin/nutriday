/**
 * Nutriday 共享类型定义
 * 所有跨应用共享的 TypeScript 类型在此统一导出
 */

/** 通用 API 响应结构 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/** 分页请求参数 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/** 分页响应数据 */
export interface PaginatedData<T = unknown> {
  /** 数据列表 */
  list: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}
