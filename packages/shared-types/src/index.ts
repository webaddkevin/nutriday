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
  // 目标设置
  targetWeight?: number;
  targetDate?: string;
  weeklyGoal?: number;
  targetCalories?: number;
}

/** 目标进度 */
export interface GoalProgress {
  goal: HealthGoal;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  progress: number; // 0-100
  targetDate?: string;
  daysRemaining?: number;
  weeklyGoal?: number;
  weeklyRequired?: number;
  targetCalories?: number;
}

/** 餐食类型 */
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

/** 餐食类型显示名称 */
export const MealTypeLabels: Record<MealType, string> = {
  [MealType.BREAKFAST]: '早餐',
  [MealType.LUNCH]: '午餐',
  [MealType.DINNER]: '晚餐',
  [MealType.SNACK]: '加餐',
};

/** 餐食类型图标 */
export const MealTypeIcons: Record<MealType, string> = {
  [MealType.BREAKFAST]: '🍳',
  [MealType.LUNCH]: '🍲',
  [MealType.DINNER]: '🥗',
  [MealType.SNACK]: '🍎',
};

/** 食物信息 */
export interface Food {
  id: number;
  name: string;
  nameEn?: string;
  category: string;
  calories: number; // kcal/100g
  protein: number; // g/100g
  carbs: number; // g/100g
  fat: number; // g/100g
  fiber?: number;
  sodium?: number;
  servingSize: number;
  unit: string;
  imageUrl?: string;
  source: string;
}

/** 饮食记录 */
export interface MealLog {
  id: number;
  userId: number;
  date: string;
  mealType: MealType;
  foodId: number;
  foodName: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/** 每日营养汇总 */
export interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    breakfast: { calories: number; items: MealLog[] };
    lunch: { calories: number; items: MealLog[] };
    dinner: { calories: number; items: MealLog[] };
    snack: { calories: number; items: MealLog[] };
  };
}
