import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsMongoId()
  user: string;

  @ApiProperty()
  @IsMongoId()
  branch: string;

  @ApiProperty()
  @IsMongoId()
  department: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  issue: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  issueComment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalComment?: string;
}
