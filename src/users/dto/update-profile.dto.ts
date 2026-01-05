import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  IsMongoId,
} from 'class-validator';

// DTO for regular users updating their own profile
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, example: '+998901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number must be valid Uzbekistan number. E.g. +998992224455',
  })
  phone?: string;

  @ApiProperty({ required: false, enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({ enum: ['active', 'blocked'] })
  @IsOptional()
  @IsEnum(['active', 'blocked'])
  status?: 'active' | 'blocked';
}

// DTO for admins updating any user
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number must be valid Uzbekistan number. E.g. +998992224455',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '455' })
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @ApiPropertyOptional({ example: '12345678900987' })
  @IsOptional()
  @IsString()
  jshshir?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({ enum: ['active', 'blocked'] })
  @IsOptional()
  @IsEnum(['active', 'blocked'])
  status?: 'active' | 'blocked';

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  branch?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}
