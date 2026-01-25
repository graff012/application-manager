import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Application>;

export type ApplicationStatus =
  | 'new'
  | 'accepted'
  | 'inProgress'
  | 'completed'
  | 'rejected';

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: true })
  index: string;

  @Prop({
    required: true,
    enum: ['new', 'accepted', 'inProgress', 'completed', 'rejected'],
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'UploadedFile' }], default: [] })
  fileIds?: Types.ObjectId[];

  @Prop()
  additionalComment: string;

  @Prop({ type: Types.ObjectId, ref: 'Inventory' })
  inventory?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Employee' }], default: [] })
  assignedTo: Types.ObjectId[];

  @Prop({ type: Date })
  deadline?: Date;

  @Prop({
    type: {
      workDone: { type: String },
      usedTools: [
        {
          tool: { type: Types.ObjectId, ref: 'Tool' },
          quantity: { type: Number },
        },
      ],
      otherTools: { type: String },
      images: [{ type: String }],
      completedAt: { type: Date },
      completedBy: { type: Types.ObjectId, ref: 'Employee' },
    },
  })
  completionReport?: {
    workDone: string;
    usedTools?: Array<{
      tool: Types.ObjectId;
      quantity: number;
    }>;
    otherTools?: string;
    images?: string[];
    completedAt: Date;
    completedBy: Types.ObjectId;
  };

  @Prop({
    type: [
      {
        status: { type: String, required: true },
        changedBy: { type: Types.ObjectId, refPath: 'history.changedByModel' },
        changedByModel: {
          type: String,
          enum: ['User', 'Employee', 'Admin'],
          required: true,
        },
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
