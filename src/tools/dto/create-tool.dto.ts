import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateToolDto {
  @ApiProperty({ example: 'Screwdriver set' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'TL-0001' })
  @IsString()
  @IsNotEmpty()
  toolNumber: string;

  @ApiProperty({ required: false, example: 'SN-TOOL-12345' })
  @IsString()
  @IsOptional()
  serial?: string;
}
