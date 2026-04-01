import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateShoppingItemDto {
  @IsNumber()
  @IsOptional()
  userId?: number; // 从 token 中获取，可选

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  amount?: string;

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
