import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  department?: string;

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
}
