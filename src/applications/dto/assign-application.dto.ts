import { IsDateString, IsNotEmpty, IsMongoId, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignApplicationDto {
  @ApiPropertyOptional({
    description: 'Array of Employee IDs to assign the application to (defaults to self if not provided)',
    type: [String],
    example: ['67abc123def456789012abcd', '67abc123def456789012abce'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  employeeIds?: string[];

  @ApiProperty({ description: 'Deadline for completing the application' })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;
}
