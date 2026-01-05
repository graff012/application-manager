
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadedFile, FileDocument } from './schemas/file.schema';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(UploadedFile.name)
    private readonly fileModel: Model<FileDocument>,
  ) {}

  create(data: {
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
  }) {
    return this.fileModel.create(data);
  }

  async findOne(id: string) {
    const file = await this.fileModel.findById(id).exec();
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }
}
