import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInventoryDto } from './create-inventory.dto';

export class UsedToolDto {
  @ApiProperty({ example: '656f8c4e4f18f9b9b726f123' })
  @IsMongoId()
  tool: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @ApiProperty({
    required: false,
    enum: ['active', 'repair', 'broken', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'repair', 'broken', 'inactive'])
  status?: string;

  @ApiProperty({
    required: false,
    type: [UsedToolDto],
    description: 'Tools used during repair (warehouse items to write off)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsedToolDto)
  usedTools?: UsedToolDto[];

  @ApiProperty({
    required: false,
    example: '151225-sonli arizaga muvofiq ishlatildi',
  })
  @IsOptional()
  @IsString()
  writeOffReason?: string;
}
