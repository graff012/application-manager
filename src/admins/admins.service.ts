import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  findAll() {
    return this.adminModel.find().exec();
  }

  async findOne(id: string) {
    const admin = await this.adminModel.findOne({ id }).exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async findByEmail(email: string) {
    return this.adminModel.findOne({ email }).exec();
  }

  async update(id: string, dto: UpdateAdminDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const admin = await this.adminModel.findOneAndUpdate({ id }, dto, { new: true }).exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async remove(id: string) {
    const result = await this.adminModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Admin not found');
    return { deleted: true };
  }
}
