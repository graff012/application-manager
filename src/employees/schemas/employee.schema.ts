import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

export type EmployeeStatus = 'active' | 'inactive';

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: EmployeeStatus;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department: Types.ObjectId;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true })
  jshshir: string;

  @Prop({ required: false })
  avatar?: string; // Path under public/avatar

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Application' }], default: [] })
  assignedApplications: Types.ObjectId[];

  @Prop({ default: 'employee' })
  role: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
