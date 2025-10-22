import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type BranchDocument = HydratedDocument<Branch>;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ required: true, unique: true })
  name: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
