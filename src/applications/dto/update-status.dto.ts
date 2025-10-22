import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['new', 'accepted', 'processed', 'rejected', 'completed'] })
  @IsIn(['new', 'accepted', 'processed', 'rejected', 'completed'])
  status: 'new' | 'accepted' | 'processed' | 'rejected' | 'completed';
}
