import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {}

  async create(dto: CreateEmployeeDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.employeeModel.create({ ...dto, password: hashedPassword });
  }

  findAll() {
    return this.employeeModel
      .find()
      .populate('position')
      .populate('branch')
      .populate('department')
      .populate('assignedApplications')
      .exec();
  }

  async findOne(id: string) {
    const employee = await this.employeeModel
      .findOne({ id })
      .populate('position')
      .populate('branch')
      .populate('department')
      .populate('assignedApplications')
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async findByEmail(email: string) {
    return this.employeeModel.findOne({ email }).populate('position').exec();
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const employee = await this.employeeModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .populate('position')
      .populate('branch')
      .populate('department')
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async remove(id: string) {
    const result = await this.employeeModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Employee not found');
    return { deleted: true };
  }

  async addAssignedApplication(employeeId: string, applicationId: any) {
    return this.employeeModel
      .findOneAndUpdate(
        { id: employeeId },
        { $addToSet: { assignedApplications: applicationId } },
        { new: true }
      )
      .exec();
  }
}
