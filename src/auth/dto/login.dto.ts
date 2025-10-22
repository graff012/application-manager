import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  tableNumber: number;
}
