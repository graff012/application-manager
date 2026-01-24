import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateInventoryComboDto } from './create-inventory-combo.dto';

export class UpdateInventoryComboDto extends PartialType(CreateInventoryComboDto) {
  @ApiProperty({
    required: false,
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
