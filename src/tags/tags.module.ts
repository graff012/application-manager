import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import * as multer from 'multer';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tag, TagSchema } from './schemas/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]),
    MulterModule.register({
      storage: multer.diskStorage({
        destination: join(process.cwd(), 'uploads', 'tags'),
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          cb(null, name);
        },
      }),
    }),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
