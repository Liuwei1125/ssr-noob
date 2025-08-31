import { IsInt, IsString, IsEmail, IsOptional, IsPositive, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// 用户创建DTO
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  age: number;

  @IsEmail()
  email: string;
}

// 用户更新DTO
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsEmail()
  email?: string;
}

// 用户ID参数DTO - 用于将字符串ID转换为数字
export class UserIdParam {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  id: number;
}