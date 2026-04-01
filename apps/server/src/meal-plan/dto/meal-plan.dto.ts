import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateMealPlanDto {
  @IsNumber()
  @IsOptional()
  userId?: number; // 从 token 中获取，可选

  @IsString()
  date: string;

  @IsString()
  mealType: string;

  @IsString()
  dishName: string;

  @IsNumber()
  @IsOptional()
  calories?: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateMealPlanDto {
  @IsString()
  @IsOptional()
  mealType?: string;

  @IsString()
  @IsOptional()
  dishName?: string;

  @IsNumber()
  @IsOptional()
  calories?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
