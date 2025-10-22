import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type ApplicationDocument = HydratedDocument<Application>;

export type ApplicationStatus = 'new' | 'accepted' | 'processed' | 'rejected' | 'completed';

@Schema({ timestamps: true })
export class Application {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ required: true })
  index: string;

  @Prop({ required: true, enum: ['new', 'accepted', 'processed', 'rejected', 'completed'], default: 'new' })
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
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
