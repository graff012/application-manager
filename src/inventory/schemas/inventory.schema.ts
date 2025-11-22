import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  inventoryNumber: string;

  @Prop()
  serial?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }], default: [] })
  tags?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branch?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department?: Types.ObjectId;

  @Prop({ enum: ['active', 'repair', 'broken'], default: 'active' })
  status: string;

  @Prop()
  qrCodeUrl: string;

  @Prop({
    type: [
      {
        action: {
          type: String,
          enum: ['assigned', 'repair', 'returned', 'broken'],
          required: true,
        },
        by: { type: Types.ObjectId, refPath: 'history.byModel' },
        byModel: { type: String, enum: ['User', 'Employee'], required: true },
        at: { type: Date, default: () => new Date() },
        comment: { type: String },
      },
    ],
    default: [],
  })
  history: Array<{
    action: string;
    by: Types.ObjectId;
    byModel: string;
    at: Date;
    comment?: string;
  }>;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
