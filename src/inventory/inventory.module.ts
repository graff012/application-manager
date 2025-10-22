import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const s3 = new S3Client({
          region: config.get<string>('AWS_S3_REGION'),
          credentials: {
            accessKeyId: config.get<string>('AWS_S3_ACCESS_KEY_ID') || '',
            secretAccessKey: config.get<string>('AWS_S3_SECRET_ACCESS_KEY') || '',
          },
        });
        const bucket = config.get<string>('AWS_S3_BUCKET_NAME') || '';
        return {
          storage: multerS3({
            s3,
            bucket,
            // no ACL header; bucket policy controls public access
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
              const ext = file.originalname.split('.').pop();
              const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
              cb(null, name);
            },
          }) as any,
        };
      },
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
