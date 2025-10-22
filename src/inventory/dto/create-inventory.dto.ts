import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  serial: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  inventoryNumber: string;

  @ApiProperty()
  @IsMongoId()
  user: string;

  @ApiProperty()
  @IsMongoId()
  branch: string;

  @ApiProperty()
  @IsMongoId()
  department: string;
}
