import {
  Body,
  Controller,
  Get,
  Param,
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @RequirePermission('applications', 'create')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() dto: CreateApplicationDto,
    @UploadedFiles() files: any[],
  ) {
    const urls = (files || [])
      .map((f: any) => this.toUploadsUrlPath(f?.path))
      .filter(Boolean);

    return this.applicationsService.create(dto, urls);
  }

  @Get()
  @RequirePermission('applications', 'read')
  findAll(@Query('user') user?: string) {
    const filter = user ? { user } : {};
    return this.applicationsService.findAll(filter);
  }

  @Get(':id')
  @RequirePermission('applications', 'read')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  private toUploadsUrlPath(filePath?: string): string {
    if (!filePath) {
      return '';
    }

    const normalized = String(filePath)
      .replace(/\\/g, '/')
      .replace(/^(\.\.\/)+/g, '')
      .replace(/^\.?\//g, '');

    const uploadsIndex = normalized.indexOf('uploads/');
    const relativePath =
      uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized;

    return `/${relativePath}`;
  }
}
