import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

/**
 * 创建/更新饮水记录 DTO
 */
export class SaveWaterDto {
  @IsNumber()
  @IsOptional()
  userId?: number; // 从 token 中获取，可选

  @IsString()
  date: string; // YYYY-MM-DD

  @IsNumber()
  @Min(0)
  @Max(10000)
  amount: number; // ml

  @IsOptional()
  @IsString()
  note?: string;
}
