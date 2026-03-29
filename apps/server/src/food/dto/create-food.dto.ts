import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fiber?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sodium?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  servingSize?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
