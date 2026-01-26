import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeductInventoryDto {
  @ApiProperty({
    example: 'Inventory deducted from active list',
  })
  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
