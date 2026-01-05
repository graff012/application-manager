import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

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

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Images attached to the application (uploaded via multipart/form-data as "images")',
  })
  @IsOptional()
  images?: any[];

  @ApiProperty({ required: false, type: [String], description: 'Uploaded file IDs.' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  fileIds?: string[];
}
