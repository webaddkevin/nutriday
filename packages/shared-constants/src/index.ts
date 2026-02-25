/**
 * Nutriday 共享常量
 * 所有跨应用共享的常量在此统一导出
 */

/** 应用名称 */
export const APP_NAME = 'Nutriday'

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20

/** API 状态码 */
export const API_CODE = {
  /** 成功 */
  SUCCESS: 0,
  /** 未授权 */
  UNAUTHORIZED: 401,
  /** 禁止访问 */
  FORBIDDEN: 403,
  /** 资源不存在 */
  NOT_FOUND: 404,
  /** 服务器错误 */
  SERVER_ERROR: 500,
} as const

/** 营养素单位 */
export const NUTRIENT_UNIT = {
  /** 千卡 */
  KCAL: 'kcal',
  /** 克 */
  GRAM: 'g',
  /** 毫克 */
  MG: 'mg',
  /** 微克 */
  UG: 'μg',
} as const
