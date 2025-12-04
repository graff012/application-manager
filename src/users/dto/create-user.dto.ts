import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Matches,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Table number must contain only digits' })
  tableNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number must be valid Uzbekistan number. E.g. +998992224455',
  })
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(14, 14, { message: 'Passport number must be 14 characters' })
  jshshir: string;

  @ApiPropertyOptional({ enum: ['active', 'blocked'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'blocked'])
  status?: 'active' | 'blocked';

  @ApiPropertyOptional({ description: 'Avatar image path under public/avatar' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  branch: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  department: string;
}
