import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
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

  async findAll() {
    try {
      return await this.employeeModel
        .find()
        .populate('branch')
        .populate('department')
        .populate('assignedApplications')
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch employees');
    }
  }

  async findByBranch(branchId: string) {
    if (!branchId) {
      throw new BadRequestException('Branch ID is required');
    }
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branch ID format');
    }
    try {
      return await this.employeeModel
        .find({ branch: branchId })
        .populate('branch')
        .populate('department')
        .populate('assignedApplications')
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch employees by branch');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Employee ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid employee ID format');
    }
    try {
      const employee = await this.employeeModel
        .findById(id)
        .populate('branch')
        .populate('department')
        .populate('assignedApplications')
        .exec();
      if (!employee) throw new NotFoundException('Employee not found');
      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch employee');
    }
  }

  async findByEmail(email: string) {
    return this.employeeModel.findOne({ email }).exec();
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    if (!id) {
      throw new BadRequestException('Employee ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid employee ID format');
    }
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    try {
      const employee = await this.employeeModel
        .findByIdAndUpdate(id, dto, { new: true })
        .populate('branch')
        .populate('department')
        .exec();
      if (!employee) throw new NotFoundException('Employee not found');
      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Employee ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid employee ID format');
    }
    try {
      const result = await this.employeeModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) throw new NotFoundException('Employee not found');
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }

  async addAssignedApplication(employeeId: string, applicationId: any) {
    return this.employeeModel
      .findByIdAndUpdate(
        employeeId,
        { $addToSet: { assignedApplications: applicationId } },
        { new: true }
      )
      .exec();
  }
}
