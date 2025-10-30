import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignApplicationDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;
}
