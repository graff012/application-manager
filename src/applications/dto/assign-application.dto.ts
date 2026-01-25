import { IsDateString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignApplicationDto {
  @ApiPropertyOptional({ description: 'Employee ID to assign the application to (defaults to self if not provided)' })
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ description: 'Deadline for completing the application' })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;
}
