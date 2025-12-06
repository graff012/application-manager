import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ToolDocument = HydratedDocument<Tool>;

@Schema({ timestamps: true })
export class Tool {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  toolNumber: string;

  @Prop({ required: false })
  serial?: string;

  @Prop({type: Number, default: 0})
  quantity: number;

  @Prop({type: Number, default: 0})
  writtenOff: number
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
