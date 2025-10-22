import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel(Department.name) private deptModel: Model<DepartmentDocument>) {}

  create(dto: CreateDepartmentDto) {
    return this.deptModel.create(dto);
  }

  findAll() {
    return this.deptModel.find().populate('branch').exec();
  }
}
