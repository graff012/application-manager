import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UsedToolDto {
  @ApiProperty({ example: '656f8c4e4f18f9b9b726f123' })
  @IsMongoId()
  tool: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CompleteApplicationDto {
  @ApiProperty({ description: 'Description of work performed' })
  @IsString()
  @IsNotEmpty()
  workDone: string;

  @ApiProperty({
    required: false,
    type: [UsedToolDto],
    description: 'Tools used from system inventory',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsedToolDto)
  usedTools?: UsedToolDto[];

  @ApiProperty({
    required: false,
    description: 'Other tools not in system',
  })
  @IsOptional()
  @IsString()
  otherTools?: string;
}
