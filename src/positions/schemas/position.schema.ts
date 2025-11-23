import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PositionDocument = HydratedDocument<Position>;

@Schema({ timestamps: true })
export class Position {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

export const PositionSchema = SchemaFactory.createForClass(Position);
