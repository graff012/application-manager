import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<AdminDocument>) {}

  async create(dto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.adminModel.create({ ...dto, password: hashedPassword });
  }

  async findAll() {
    try {
      return await this.adminModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch admins');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Admin ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid admin ID format');
    }
    try {
      const admin = await this.adminModel.findById(id).exec();
      if (!admin) throw new NotFoundException('Admin not found');
      return admin;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch admin');
    }
  }

  async findByEmail(email: string) {
    return this.adminModel.findOne({ email }).exec();
  }

  async update(id: string, dto: UpdateAdminDto) {
    if (!id) {
      throw new BadRequestException('Admin ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid admin ID format');
    }
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    try {
      const admin = await this.adminModel.findByIdAndUpdate(id, dto, { new: true }).exec();
      if (!admin) throw new NotFoundException('Admin not found');
      return admin;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update admin');
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Admin ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid admin ID format');
    }
    try {
      const result = await this.adminModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) throw new NotFoundException('Admin not found');
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete admin');
    }
  }
}
