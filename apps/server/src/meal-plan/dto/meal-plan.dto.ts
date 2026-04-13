import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMealPlanDto {
  @IsString()
  date: string;

  @IsString()
  mealType: string;

  @IsNumber()
  @IsOptional()
  foodId?: number;

  @IsString()
  @IsOptional()
  foodName?: string;

  @IsString()
  dishName: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  calories: number;

  @IsNumber()
  @IsOptional()
  protein?: number;

  @IsNumber()
  @IsOptional()
  carbs?: number;

  @IsNumber()
  @IsOptional()
  fat?: number;

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
  amount?: number;

  @IsNumber()
  @IsOptional()
  calories?: number;

  @IsNumber()
  @IsOptional()
  protein?: number;

  @IsNumber()
  @IsOptional()
  carbs?: number;

  @IsNumber()
  @IsOptional()
  fat?: number;

  @IsBoolean()
  @IsOptional()
  logged?: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}
