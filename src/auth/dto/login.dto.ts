import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  tableNumber: number;

  @ApiProperty({
    example: '12345678910121',
    description: 'Passport number (14 digits, jshshir)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(14, 14)
  passportNumber: string;
}
