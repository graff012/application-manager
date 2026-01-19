import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsString,
  IsMongoId,
} from 'class-validator';

export class CreateToolDto {
  @ApiProperty({ example: 'Screwdriver set' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'TL-0001' })
  @IsString()
  @IsNotEmpty()
  toolNumber: string;

  @ApiProperty({ required: false, example: 'SN-TOOL-12345' })
  @IsString()
  @IsOptional()
  serial?: string;

  @ApiProperty({ required: true, example: 0 })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: true, type: [String], example: ['12345678923456'] })
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  tags: string[];
}
