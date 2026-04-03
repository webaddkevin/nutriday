import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Gender, HealthGoal } from '@nutriday/shared-types';

// 获取 const object 的所有值作为数组
const genderValues = Object.values(Gender);
const healthGoalValues = Object.values(HealthGoal);

/**
 * 保存用户画像 DTO
 * 用于 POST /profile 请求体校验
 */
export class SaveProfileDto {
  /** 用户 ID（从 token 中获取，可选） */
  userId?: number;

  /** 性别 */
  @IsIn(genderValues, { message: '性别值无效' })
  gender: Gender;

  /** 年龄 */
  @IsNumber({}, { message: '年龄必须是数字' })
  @Min(1, { message: '年龄必须大于0' })
  @Max(150, { message: '年龄必须小于150' })
  age: number;

  /** 身高 (cm) */
  @IsNumber({}, { message: '身高必须是数字' })
  @Min(50, { message: '身高必须大于50cm' })
  @Max(300, { message: '身高必须小于300cm' })
  height: number;

  /** 体重 (kg) */
  @IsNumber({}, { message: '体重必须是数字' })
  @Min(20, { message: '体重必须大于20kg' })
  @Max(500, { message: '体重必须小于500kg' })
  weight: number;

  /** 健康目标 */
  @IsIn(healthGoalValues, { message: '健康目标值无效' })
  goal: HealthGoal;

  /** 特殊标签数组 */
  @IsArray({ message: '标签必须是数组' })
  @IsString({ each: true, message: '标签元素必须是字符串' })
  tags: string[];

  /** 活动水平系数 */
  @IsNumber({}, { message: '活动水平必须是数字' })
  activityLevel: number;

  /** 基础代谢率 */
  @IsOptional()
  @IsNumber({}, { message: 'BMR必须是数字' })
  bmr?: number;

  /** 每日总能量消耗 */
  @IsOptional()
  @IsNumber({}, { message: 'TDEE必须是数字' })
  tdee?: number;

  /** 用户昵称 */
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;

  /** 用户头像 URL */
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatarUrl?: string;

  /** 目标体重 (kg) */
  @IsOptional()
  @IsNumber({}, { message: '目标体重必须是数字' })
  targetWeight?: number;

  /** 目标日期 (YYYY-MM-DD) */
  @IsOptional()
  @IsString({ message: '目标日期必须是字符串' })
  targetDate?: string;

  /** 每周目标变化 (kg)，正数增重，负数减重 */
  @IsOptional()
  @IsNumber({}, { message: '每周目标必须是数字' })
  weeklyGoal?: number;

  /** 目标每日热量 */
  @IsOptional()
  @IsNumber({}, { message: '目标热量必须是数字' })
  targetCalories?: number;

  /** 过敏原数组 */
  @IsOptional()
  @IsArray({ message: '过敏原必须是数组' })
  @IsString({ each: true, message: '过敏原元素必须是字符串' })
  allergies?: string[];

  /** 慢性疾病数组 */
  @IsOptional()
  @IsArray({ message: '疾病必须是数组' })
  @IsString({ each: true, message: '疾病元素必须是字符串' })
  diseases?: string[];

  /** 用药情况数组 */
  @IsOptional()
  @IsArray({ message: '用药情况必须是数组' })
  @IsString({ each: true, message: '用药元素必须是字符串' })
  medications?: string[];

  /** 饮食限制数组 */
  @IsOptional()
  @IsArray({ message: '饮食限制必须是数组' })
  @IsString({ each: true, message: '饮食限制元素必须是字符串' })
  dietaryRestrictions?: string[];

  /** 其他健康备注 */
  @IsOptional()
  @IsString({ message: '健康备注必须是字符串' })
  healthNotes?: string;
}
