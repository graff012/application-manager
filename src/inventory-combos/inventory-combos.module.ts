import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { InventoryCombosController } from './inventory-combos.controller';
import { InventoryCombosService } from './inventory-combos.service';
import {
  InventoryCombo,
  InventoryComboSchema,
} from './schemas/inventory-combo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryCombo.name, schema: InventoryComboSchema },
    ]),
    MulterModule.register({
      storage: require('multer').diskStorage({
        destination: 'uploads/inventory-combos',
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          cb(null, name);
        },
      }),
    }),
  ],
  controllers: [InventoryCombosController],
  providers: [InventoryCombosService],
  exports: [InventoryCombosService],
})
export class InventoryCombosModule {}
