import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignApplicationDto {
  @ApiProperty({ description: 'Deadline for completing the application' })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;
}
