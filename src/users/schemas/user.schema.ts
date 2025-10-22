import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

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

  @Prop({
    type: [
      {
        inventory: { type: Types.ObjectId, ref: 'Inventory', required: true },
        action: { type: String, required: true },
        timestamp: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  inventoryHistory: Array<{
    inventory: Types.ObjectId;
    action: string;
    timestamp: Date;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
