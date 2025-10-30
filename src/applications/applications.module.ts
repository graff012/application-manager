import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ApplicationsEmployeeController } from './applications-employee.controller';
import { ApplicationsUserController } from './applications-user.controller';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { TelegramModule } from '../telegram/telegram.module';
import { EmployeesModule } from '../employees/employees.module';
import { PositionsModule } from '../positions/positions.module';
import { EmployeeGateway } from '../employees/employee.gateway';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    TelegramModule,
    EmployeesModule,
    PositionsModule,
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
            // acl removed to avoid AccessControlListNotSupported when Object Ownership enforces bucket owner
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
  controllers: [ApplicationsController, ApplicationsEmployeeController, ApplicationsUserController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
