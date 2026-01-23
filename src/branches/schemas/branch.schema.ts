import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BranchDocument = HydratedDocument<Branch>;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
