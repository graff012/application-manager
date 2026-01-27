import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
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
  findAll(
    @Query('user') user?: string,
    @Query('branch') branch?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?,
  ) {
    const filter: any = {};
    if (user) filter.user = user;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;

    // Employees only see their assigned applications, admins see all
    if (req?.user?.role === 'employee') {
      filter.assignedTo = req.user.userId;
    }

    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);
    const pagination = {
      limit:
        Number.isFinite(parsedLimit) && parsedLimit > 0
          ? parsedLimit
          : undefined,
      offset:
        Number.isFinite(parsedOffset) && parsedOffset >= 0
          ? parsedOffset
          : undefined,
    };

    return this.applicationsService.findAll(filter, pagination);
  }

  @Get('status-count')
  @RequirePermission('applications', 'read')
  countByStatus(
    @Query('user') user?: string,
    @Request() req?,
  ) {
    const filter: any = {};
    if (user) filter.user = user;

    if (req?.user?.role === 'employee') {
      filter.assignedTo = req.user.userId;
    }

    return this.applicationsService.countByStatus(filter);
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
