
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';
import type { Multer } from 'multer';
import type { Response } from 'express';
import * as path from 'path';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: Multer.File) {
    if (!file?.path) {
      throw new NotFoundException('File not provided');
    }

    const relativePath = this.toUploadsRelativePath(file.path);
    const url = this.toUploadsUrlPath(relativePath);

    return this.filesService.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      url,
    });
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.findOne(id);
    const absolutePath = path.join(process.cwd(), file.path);
    return res.sendFile(absolutePath);
  }

  private toUploadsRelativePath(filePath: string): string {
    const normalized = String(filePath).replace(/\\/g, '/');
    const cwd = process.cwd().replace(/\\/g, '/');
    if (normalized.startsWith(cwd)) {
      return normalized.slice(cwd.length + 1);
    }
    return normalized.replace(/^(\.\.\/)+/g, '').replace(/^\.?\//g, '');
  }

  private toUploadsUrlPath(relativePath: string): string {
    const normalized = relativePath.replace(/\\/g, '/');
    const uploadsIndex = normalized.indexOf('uploads/');
    const relative =
      uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized;
    return `/${relative}`;
  }
}
