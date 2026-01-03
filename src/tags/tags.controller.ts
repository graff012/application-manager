import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreateTagDto, @UploadedFile() file?: Multer.File) {
    if (file?.path) {
      dto.image = this.toUploadsUrlPath(file.path);
    }
    return this.tagsService.create(dto);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get('with-count')
  findAllWithToolCount() {
    return this.tagsService.findAllWithToolCount();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Get(':id/with-count')
  findOneWithToolCount(@Param('id') id: string) {
    return this.tagsService.findOneWithToolCount(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
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
