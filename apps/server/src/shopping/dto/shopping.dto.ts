import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateShoppingItemDto {
  @IsNumber()
  userId: number;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  amount: string;

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
