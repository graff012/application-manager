import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ['new', 'assigned', 'progressing', 'completed', 'rejected'],
  })
  @IsEnum(['new', 'assigned', 'progressing', 'completed', 'rejected'])
  @IsNotEmpty()
  status: 'new' | 'assigned' | 'progressing' | 'completed' | 'rejected';
}
