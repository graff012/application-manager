import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsInt()
  tableNumber: number;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  branch?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  department?: string;
}
