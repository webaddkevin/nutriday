/**
 * 保存用户画像 DTO
 * 用于 POST /profile 请求体校验
 */
export class SaveProfileDto {
  /** 用户 ID（从 token 中获取，可选） */
  userId?: number;

  /** 性别 */
  gender: string;

  /** 年龄 */
  age: number;

  /** 身高 (cm) */
  height: number;

  /** 体重 (kg) */
  weight: number;

  /** 健康目标 */
  goal: string;

  /** 特殊标签数组 */
  tags: string[];

  /** 活动水平系数 */
  activityLevel: number;

  /** 基础代谢率 */
  bmr?: number;

  /** 每日总能量消耗 */
  tdee?: number;

  /** 用户昵称 */
  nickname?: string;

  /** 用户头像 URL */
  avatarUrl?: string;

  /** 目标体重 (kg) */
  targetWeight?: number;

  /** 目标日期 (YYYY-MM-DD) */
  targetDate?: string;

  /** 每周目标变化 (kg)，正数增重，负数减重 */
  weeklyGoal?: number;

  /** 目标每日热量 */
  targetCalories?: number;

  /** 过敏原数组 */
  allergies?: string[];

  /** 慢性疾病数组 */
  diseases?: string[];

  /** 用药情况数组 */
  medications?: string[];

  /** 饮食限制数组 */
  dietaryRestrictions?: string[];

  /** 其他健康备注 */
  healthNotes?: string;
}
