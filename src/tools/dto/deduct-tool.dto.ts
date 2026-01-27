import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeductToolDto {
  @ApiPropertyOptional({ example: 'Damaged during repair' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: 'Broken' })
  @IsOptional()
  @IsString()
  reason?: string;
}
