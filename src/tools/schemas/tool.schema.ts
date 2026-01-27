import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ToolDocument = HydratedDocument<Tool>;

@Schema({ timestamps: true })
export class Tool {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  toolNumber: string;

  @Prop({ required: false })
  serial?: string;

  @Prop({ type: Number, default: 0 })
  quantity: number;

  @Prop({ type: Number, default: 0, min: 0 })
  writtenOff: number;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', required: true })
  tags: Types.ObjectId[];

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({
    type: [
      {
        action: { type: String, enum: ['deducted'], required: true },
        by: { type: Types.ObjectId, refPath: 'history.byModel' },
        byModel: { type: String, enum: ['Employee', 'Admin'], required: true },
        at: { type: Date, default: () => new Date() },
        comment: { type: String },
        reason: { type: String },
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
    reason?: string;
  }>;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
