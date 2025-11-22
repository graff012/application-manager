import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: '#3/printer1' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
