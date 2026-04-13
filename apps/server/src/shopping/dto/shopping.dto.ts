import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateShoppingItemDto {
  @IsNumber()
  @IsOptional()
  foodId?: number;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  unit?: string;

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
  checked?: boolean;
}

export class UpdateShoppingItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsBoolean()
  @IsOptional()
  checked?: boolean;
}
