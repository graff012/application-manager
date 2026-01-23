import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtendDeadlineDto {
  @ApiProperty({ description: 'Reason for extending the deadline' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'New deadline date' })
  @IsDateString()
  @IsNotEmpty()
  newDeadline: string;
}
