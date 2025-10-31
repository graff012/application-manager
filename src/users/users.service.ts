import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(dto: CreateUserDto) {
    return this.userModel.create(dto);
  }

  findAll() {
    return this.userModel.find().populate('branch').populate('department').exec();
  }

  findByTableNumber(tableNumber: number) {
    return this.userModel.findOne({ tableNumber }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel
      .findOne({ id })
      .populate('branch')
      .populate('department')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findOne({ id: userId }).exec();
    if (!user) throw new NotFoundException('User not found');

    if (dto.phone) user.phone = dto.phone;
    if (dto.gender) user.gender = dto.gender;

    // Mark profile as complete if both phone and gender are provided
    if (user.phone && user.gender) {
      user.profileComplete = true;
    }

    await user.save();
    return user;
  }
}
