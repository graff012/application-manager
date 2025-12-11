import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

export type EmployeeStatus = 'active' | 'inactive';

// define permission structure
export class ResourcePermissions {
  @Prop({ default: false })
  create?: boolean;

  @Prop({ default: false })
  read?: boolean;

  @Prop({ default: false })
  update?: boolean;

  @Prop({ default: false })
  delete?: boolean;
}

export class Permissions {
  @Prop({ type: ResourcePermissions, default: {} })
  departments?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  employees?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  branches?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  applications?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  users?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  inventories?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  tags?: ResourcePermissions;

  @Prop({ type: ResourcePermissions, default: {} })
  tools?: ResourcePermissions;
}

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

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branch: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
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

  @Prop({ type: Permissions, default: {} })
  permissions?: Permissions;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
