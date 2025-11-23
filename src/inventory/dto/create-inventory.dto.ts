import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ example: 'Canon mf3010' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2000102' })
  @IsString()
  @IsNotEmpty()
  inventoryNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiProperty()
  @IsMongoId()
  user: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  branch?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  department?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tools?: string[];
}
