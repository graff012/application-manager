import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel(Department.name) private deptModel: Model<DepartmentDocument>) {}

  async create(dto: CreateDepartmentDto) {
    try {
      return await this.deptModel.create(dto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create department');
    }
  }

  async findAll() {
    try {
      return await this.deptModel.find().populate('branch').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  async findByBranch(branchId: string) {
    if (!branchId) {
      throw new BadRequestException('Branch id is required');
    }
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branch id format');
    }
    try {
      return await this.deptModel.find({ branch: branchId }).populate('branch').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch departments by branch');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Department id is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid department id format');
    }
    try {
      const department = await this.deptModel.findById(id).populate('branch').exec();
      if (!department) throw new NotFoundException('Department not found');
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch department');
    }
  }

  async update(id: string, dto: CreateDepartmentDto) {
    if (!id) {
      throw new BadRequestException('Department id is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid department id format');
    }
    try {
      const department = await this.deptModel.findByIdAndUpdate(id, dto, { new: true }).populate('branch').exec();
      if (!department) throw new NotFoundException('Department not found');
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update department');
    }
  }

  async delete(id: string) {
    if (!id) {
      throw new BadRequestException('Department id is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid department id format');
    }
    try {
      const department = await this.deptModel.findByIdAndDelete(id).exec();
      if (!department) throw new NotFoundException('Department not found');
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete department');
    }
  }
}