/**
 * 保存用户画像 DTO
 * 用于 POST /profile 请求体校验
 */
export class SaveProfileDto {
  /** 用户 ID */
  userId: number;

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
}
