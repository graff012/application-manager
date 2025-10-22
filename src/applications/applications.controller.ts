import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() dto: CreateApplicationDto,
    @UploadedFiles() files: any[],
  ) {
    const urls = (files || []).map((f: any) => f.location).filter(Boolean);
    return this.applicationsService.create(dto, urls);
  }

  @Get()
  findAll(@Query('user') user?: string) {
    const filter = user ? { user } : {};
    return this.applicationsService.findAll(filter);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.applicationsService.updateStatus(id, body.status);
  }
}
