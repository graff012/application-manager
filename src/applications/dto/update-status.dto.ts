import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['new', 'assigned', 'progressing', 'testing', 'completed', 'rejected'] })
  @IsEnum(['new', 'assigned', 'progressing', 'testing', 'completed', 'rejected'])
  @IsNotEmpty()
  status: 'new' | 'assigned' | 'progressing' | 'testing' | 'completed' | 'rejected';
}
