import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ unique: true, required: true })
  tableNumber: number;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
