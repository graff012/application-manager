import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ required: true })
  serial: number;

  @Prop({ required: true, unique: true })
  inventoryNumber: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department: Types.ObjectId;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
