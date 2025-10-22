import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsInt()
  tableNumber: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  branch?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  department?: string;
}
