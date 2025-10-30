import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('applications-user')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationsUserController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('my')
  @Roles('user')
  async getMyApplications(@Request() req) {
    const userId = req.user.userId;
    return this.applicationsService.findByUser(userId);
  }
}
