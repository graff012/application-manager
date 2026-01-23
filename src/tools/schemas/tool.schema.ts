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
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
