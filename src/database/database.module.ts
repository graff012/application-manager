import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { Admin, AdminSchema } from '../admins/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    ConfigModule,
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
