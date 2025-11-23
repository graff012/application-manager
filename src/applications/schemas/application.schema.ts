import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Application>;

export type ApplicationStatus =
  | 'new'
  | 'assigned'
  | 'progressing'
  | 'completed'
  | 'rejected';

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: true })
  index: string;

  @Prop({
    required: true,
    enum: ['new', 'assigned', 'progressing', 'completed', 'rejected'],
    default: 'new',
  })
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

  @Prop({ type: Types.ObjectId, ref: 'Inventory' })
  inventory?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assignedTo: Types.ObjectId;

  @Prop({
    type: [
      {
        status: { type: String, required: true },
        changedBy: { type: Types.ObjectId, refPath: 'history.changedByModel' },
        changedByModel: { type: String, enum: ['User', 'Employee'], required: true },
        changedAt: { type: Date, default: () => new Date() },
        comment: { type: String },
      },
    ],
    default: [],
  })
  history: Array<{
    status: string;
    changedBy: Types.ObjectId;
    changedByModel: string;
    changedAt: Date;
    comment?: string;
  }>;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
