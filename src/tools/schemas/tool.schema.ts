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
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
