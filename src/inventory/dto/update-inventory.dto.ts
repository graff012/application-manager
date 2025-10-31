import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @ApiProperty({ required: false, enum: ['active', 'repair', 'broken'] })
  @IsOptional()
  @IsEnum(['active', 'repair', 'broken'])
  status?: string;
}
