import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';
import type { Multer } from 'multer';
import type { Response } from 'express';
import * as path from 'path';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'files', maxCount: 1 },
    ]),
  )
  async upload(
    @UploadedFiles()
    files?: {
      file?: Multer.File[];
      files?: Multer.File[];
    },
  ) {
    const file = files?.file?.[0] ?? files?.files?.[0];
    if (!file?.path) {
      throw new BadRequestException(
        'File not provided. Use multipart/form-data with a "file" field.',
      );
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
