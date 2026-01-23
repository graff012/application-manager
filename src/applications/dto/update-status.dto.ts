import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ['new', 'accepted', 'inProgress', 'completed', 'rejected'],
  })
  @IsEnum(['new', 'accepted', 'inProgress', 'completed', 'rejected'])
  @IsNotEmpty()
  status: 'new' | 'accepted' | 'inProgress' | 'completed' | 'rejected';

  @ApiProperty({
    required: false,
    description:
      'Optional status change comment. REQUIRED when status = "rejected" (reason for rejection).',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
