import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInventoryComboDto {
  @ApiProperty({ description: 'Combo name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Array of inventory IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  devices?: string[];

  @ApiProperty({ description: 'Combo image', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
