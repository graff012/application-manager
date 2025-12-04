import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tableNumber: string;

  @ApiProperty({
    example: '12345678910121',
    description: 'Passport number (14 digits, jshshir)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(14, 14)
  jshshir: string;
}
