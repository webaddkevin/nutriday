import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WechatLoginDto {
  @IsNotEmpty({ message: 'code 不能为空' })
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
