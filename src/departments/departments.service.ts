import { Injectable, BadRequestException } from '@nestjs/common';
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

  findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Department id is required');
    }
    return this.deptModel.findById(id).populate('branch').exec();
  }

  update(id: string, dto: CreateDepartmentDto) {
    if (!id) {
      throw new BadRequestException('Department id is required');
    }
    return this.deptModel.findByIdAndUpdate(id, dto, { new: true }).populate('branch').exec();
  }

  delete(id: string) {
    if (!id) {
      throw new BadRequestException('Department id is required');
    }
    return this.deptModel.findByIdAndDelete(id).exec();
  }
}