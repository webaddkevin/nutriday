import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

/**
 * 创建/更新体重记录 DTO
 */
export class SaveWeightDto {
  @IsNumber()
  @IsOptional()
  userId?: number; // 从 token 中获取，可选

  @IsString()
  date: string; // YYYY-MM-DD

  @IsNumber()
  @Min(20)
  @Max(300)
  weight: number; // kg

  @IsOptional()
  @IsString()
  note?: string;
}
