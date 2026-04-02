/**
 * Nutriday 共享工具函数
 * 所有跨应用共享的工具函数在此统一导出
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date - 日期对象或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 判断值是否为空（null、undefined、空字符串、空数组）
 * @param value - 待检查的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

import { Gender, ActivityLevel, HealthGoal, SpecialTag } from '@nutriday/shared-types';

/**
 * 计算基础代谢率 (BMR) - 使用 Mifflin-St Jeor 公式
 * @param gender - 性别
 * @param age - 年龄
 * @param height - 身高 (cm)
 * @param weight - 体重 (kg)
 * @returns BMR (kcal/day)
 */
export function calculateBMR(gender: Gender, age: number, height: number, weight: number): number {
  if (gender === Gender.MALE) {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * 计算每日总能量消耗 (TDEE)
 * @param bmr - 基础代谢率
 * @param activityLevel - 活动水平系数（可以是枚举或数字）
 * @returns TDEE (kcal/day)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel | number): number {
  return Math.round(bmr * activityLevel);
}

/**
 * 根据目标计算热量调整值
 * @param tdee - 每日总能量消耗
 * @param goal - 健康目标
 * @returns 热量调整值（正数为增加，负数为减少）
 */
export function calculateCalorieAdjust(tdee: number, goal: HealthGoal): number {
  switch (goal) {
    case HealthGoal.LOSE_FAT:
      // 减脂：建议 15-20% 热量缺口，最大不超过 500 kcal
      return -Math.min(Math.round(tdee * 0.18), 500);
    case HealthGoal.GAIN_MUSCLE:
      // 增肌：建议 10-15% 热量盈余
      return Math.round(tdee * 0.12);
    case HealthGoal.HEALTH_MANAGEMENT:
    case HealthGoal.MAINTAIN:
    default:
      return 0;
  }
}

/**
 * 计算目标热量
 * @param tdee - 每日总能量消耗
 * @param goal - 健康目标
 * @param specialTags - 特殊标签（如孕期、糖尿病等）
 * @returns 目标热量 (kcal/day)
 */
export function calculateTargetCalories(
  tdee: number,
  goal: HealthGoal,
  specialTags: SpecialTag[] = [],
): number {
  let adjust = calculateCalorieAdjust(tdee, goal);

  // 特殊情况调整
  if (specialTags.includes(SpecialTag.PREGNANCY)) {
    // 孕期中晚期需要额外热量
    adjust += 300;
  }
  if (specialTags.includes(SpecialTag.LACTATION)) {
    // 哺乳期需要额外热量
    adjust += 500;
  }

  // 糖尿病患者热量缺口不宜过大
  if (specialTags.includes(SpecialTag.DIABETES) && goal === HealthGoal.LOSE_FAT) {
    // 限制热量缺口不超过 15%
    adjust = Math.max(adjust, -Math.round(tdee * 0.15));
  }

  return Math.round(tdee + adjust);
}

/** 三大营养素分配结果 */
export interface MacroDistribution {
  protein: number; // 克
  carbs: number; // 克
  fat: number; // 克
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
}

/**
 * 计算三大营养素分配
 * @param targetCalories - 目标热量
 * @param weight - 体重 (kg)
 * @param goal - 健康目标
 * @returns 三大营养素分配
 */
export function calculateMacroDistribution(
  targetCalories: number,
  weight: number,
  goal: HealthGoal,
): MacroDistribution {
  let proteinPerKg: number;
  let fatPercentage: number;

  switch (goal) {
    case HealthGoal.LOSE_FAT:
      proteinPerKg = 1.8; // 减脂需要更高蛋白保护肌肉
      fatPercentage = 0.25;
      break;
    case HealthGoal.GAIN_MUSCLE:
      proteinPerKg = 2.0; // 增肌需要充足蛋白
      fatPercentage = 0.25;
      break;
    case HealthGoal.HEALTH_MANAGEMENT:
    case HealthGoal.MAINTAIN:
    default:
      proteinPerKg = 1.2;
      fatPercentage = 0.3;
      break;
  }

  const protein = Math.round(proteinPerKg * weight);
  const proteinKcal = protein * 4;

  const fatKcal = Math.round(targetCalories * fatPercentage);
  const fat = Math.round(fatKcal / 9);

  const carbsKcal = targetCalories - proteinKcal - fatKcal;
  const carbs = Math.round(carbsKcal / 4);

  return {
    protein,
    carbs,
    fat,
    proteinKcal,
    carbsKcal,
    fatKcal,
  };
}
