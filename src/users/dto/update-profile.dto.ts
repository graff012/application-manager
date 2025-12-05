import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  IsMongoId,
} from 'class-validator';

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
