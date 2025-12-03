import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  tableNumber: number;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department: Types.ObjectId;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  jshshir: string;

  @Prop({ enum: ['active', 'blocked'], default: 'active' })
  status: 'active' | 'blocked';

  @Prop({ required: false })
  avatar?: string; // Path under public/avatar

  @Prop({ required: false, enum: ['male', 'female', 'other'] })
  gender?: string;

  @Prop({ default: false })
  profileComplete: boolean;

  @Prop({ required: false })
  birthday?: Date;

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

  public static postSchemaCreation(schema: any) {
    // Defines the unique index AFTER the schema is created,
    // applying the partial filter to ignore existing 'null' duplicates.
    schema.index(
      { jshshir: 1 },
      {
        unique: true,
        partialFilterExpression: { jshshir: { $exists: true, $ne: null } },
      },
    );
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

User.postSchemaCreation(UserSchema);
