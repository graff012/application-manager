import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class ResourcePermissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  create?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  update?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}

export class PermissionDto {
  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  departments?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  branches?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  users?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  applications?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  employees?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  inventories?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  tags?: ResourcePermissionDto;

  @ApiPropertyOptional({ type: ResourcePermissionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcePermissionDto)
  tools?: ResourcePermissionDto;
}
