import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeductInventoryDto {
  @ApiProperty({
    example: 'Inventory deducted from active list',
  })
  @IsString()
  comment: string;

  @ApiPropertyOptional({
    example: 'Device status inactive or deduction from active',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
