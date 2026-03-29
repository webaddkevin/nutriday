import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export class CreateMealLogDto {
  @IsNumber()
  userId: number;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsEnum(MealType)
  mealType: MealType;

  @IsNumber()
  foodId: number;

  @IsNumber()
  @Min(1)
  amount: number; // 食用量（克）

  @IsString()
  @IsOptional()
  note?: string;
}
