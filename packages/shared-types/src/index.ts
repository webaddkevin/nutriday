/**
 * Nutriday 共享类型定义
 * 所有跨应用共享的 TypeScript 类型在此统一导出
 */

/** 通用 API 响应结构 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
}

/** 分页请求参数 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/** 分页响应数据 */
export interface PaginatedData<T = unknown> {
  /** 数据列表 */
  list: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}
/** 性别 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

/** 健康目标 */
export enum HealthGoal {
  GAIN_MUSCLE = 'gain_muscle',
  LOSE_FAT = 'lose_fat',
  MAINTAIN = 'maintain',
  HEALTH_MANAGEMENT = 'health_management',
}

/** 特殊标签 */
export enum SpecialTag {
  DIABETES = 'diabetes',
  HYPERTENSION = 'hypertension',
  PREGNANCY = 'pregnancy',
  LACTATION = 'lactation',
  VEGETARIAN = 'vegetarian',
}

/** 活动水平系数 */
export enum ActivityLevel {
  SEDENTARY = 1.2, // 久坐
  LIGHTLY_ACTIVE = 1.375, // 轻度活跃
  MODERATELY_ACTIVE = 1.55, // 中度活跃
  VERY_ACTIVE = 1.725, // 高度活跃
  EXTRA_ACTIVE = 1.9, // 极高强度
}

/** 用户画像 */
export interface UserProfile {
  name?: string;
  nickname?: string;
  avatarUrl?: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: HealthGoal;
  tags: SpecialTag[];
  activityLevel: ActivityLevel;
  bmr?: number;
  tdee?: number;
}
