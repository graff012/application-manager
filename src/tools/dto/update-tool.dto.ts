import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateToolDto } from './create-tool.dto';

export class UpdateToolDto extends PartialType(CreateToolDto) {
  @ApiProperty({ required: false, description: 'Number of tools written off' })
  @IsOptional()
  @IsNumber()
  writtenOff?: number;
}
