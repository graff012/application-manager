import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Tool, ToolSchema } from '../tools/schemas/tool.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: User.name, schema: UserSchema },
      { name: Tool.name, schema: ToolSchema }, // <-- important
    ]),
    ConfigModule,
    MulterModule.register({
      storage: require('multer').diskStorage({
        destination: '/uploads/inventory',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const name = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}.${ext}`;
          cb(null, name);
        },
      }),
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
