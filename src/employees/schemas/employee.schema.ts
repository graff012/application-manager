import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type EmployeeDocument = HydratedDocument<Employee>;

export type EmployeeStatus = 'active' | 'inactive';

@Schema({ timestamps: true })
export class Employee {
  @Prop({ default: () => uuid() })
  id: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
  position: Types.ObjectId;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: EmployeeStatus;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Application' }], default: [] })
  assignedApplications: Types.ObjectId[];

  @Prop({ default: 'employee' })
  role: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
