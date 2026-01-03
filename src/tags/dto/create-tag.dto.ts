import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: '#3/printer1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'for work' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  image?: string;
}
