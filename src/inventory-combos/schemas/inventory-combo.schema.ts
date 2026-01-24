import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryComboDocument = HydratedDocument<InventoryCombo>;

@Schema({ timestamps: true })
export class InventoryCombo {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Inventory' }], default: [] })
  devices: Types.ObjectId[];

  @Prop()
  image?: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const InventoryComboSchema = SchemaFactory.createForClass(InventoryCombo);
