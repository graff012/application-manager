import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  inventoryNumber: string;

  @Prop()
  serial?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'UploadedFile' }], default: [] })
  fileIds?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, refPath: 'assignedToModel' })
  assignedTo?: Types.ObjectId;

  @Prop({ enum: ['User', 'Employee'], required: false })
  assignedToModel?: string;

  @Prop()
  assignedAt?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }], default: [] })
  tags?: Types.ObjectId[];

  // @Prop({ type: [{ type: Types.ObjectId, ref: 'Tool' }], default: [] })
  // tools?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branch?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department?: Types.ObjectId;

  @Prop({ enum: ['active', 'repair', 'broken', 'inactive'], default: 'active' })
  status: string;

  @Prop()
  qrCodeUrl: string;

  @Prop()
  buyReason?: string;

  @Prop()
  takenTime?: Date;

  @Prop({
    type: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    default: [],
  })
  additionalParametr?: Array<{
    key: string;
    value: string;
  }>;

  @Prop({
    type: [
      {
        action: {
          type: String,
          enum: [
            'assigned',
            'repair',
            'returned',
            'broken',
            'active',
            'inactive',
          ],
          required: true,
        },
        by: { type: Types.ObjectId, refPath: 'history.byModel' },
        byModel: { type: String, enum: ['User', 'Employee'], required: true },
        at: { type: Date, default: () => new Date() },
        comment: { type: String },
        reason: {type: String}

        // new: list of tools used in repair
        usedTools: [
          {
            tool: { type: Types.ObjectId, ref: 'Tool', required: true },
            quantity: { type: Number, required: true, min: 1 },
          },
        ],
        writtenOffReason: { type: String },
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
    reason?: string
    usedTools?: {
      tool: Types.ObjectId;
      quantity: number;
    }[];

    writtenOffReason?: string;
  }>;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
