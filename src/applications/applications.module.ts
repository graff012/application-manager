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
import { EmployeeGateway } from '../employees/employee.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    TelegramModule,
    EmployeesModule,
    ConfigModule,
    MulterModule.register({
      storage: require('multer').diskStorage({
        destination: './uploads/applications',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          cb(null, name);
        },
      }),
    }),
  ],
  controllers: [ApplicationsController, ApplicationsEmployeeController, ApplicationsUserController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
