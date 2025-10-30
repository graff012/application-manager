import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type ApplicationDocument = HydratedDocument<Application>;

export type ApplicationStatus = 'new' | 'assigned' | 'progressing' | 'testing' | 'completed' | 'rejected';

@Schema({ timestamps: true })
export class Application {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ required: true })
  index: string;

  @Prop({ required: true, enum: ['new', 'assigned', 'progressing', 'testing', 'completed', 'rejected'], default: 'new' })
  status: ApplicationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department: Types.ObjectId;

  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  issue: string;

  @Prop()
  issueComment: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  additionalComment: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assignedTo: Types.ObjectId;

  @Prop({
    type: [
      {
        status: { type: String, required: true },
        assignedTo: { type: Types.ObjectId, ref: 'Employee' },
        changedBy: { type: Types.ObjectId, ref: 'Employee' },
        timestamp: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  history: Array<{
    status: string;
    assignedTo: Types.ObjectId;
    changedBy: Types.ObjectId;
    timestamp: Date;
  }>;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
