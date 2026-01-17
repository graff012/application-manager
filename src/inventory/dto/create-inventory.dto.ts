import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @ApiProperty({
    required: false,
    enum: ['active', 'repair', 'broken', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'repair', 'broken', 'inactive'])
  status?: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  user?: string;

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

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Uploaded file IDs.',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  fileIds?: string[];

  @ApiPropertyOptional({ description: 'Reason for purchasing inventory' })
  @IsOptional()
  @IsString()
  buyReason?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the inventory was taken',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  takenTime?: string;
}
