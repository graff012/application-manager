
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import * as multer from 'multer';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UploadedFile, FileSchema } from './schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadedFile.name, schema: FileSchema },
    ]),
    MulterModule.register({
      storage: multer.diskStorage({
        destination: join(process.cwd(), 'uploads', 'files'),
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          cb(null, name);
        },
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
