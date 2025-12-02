import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    if (!dto.tableNumber) {
      throw new BadRequestException('Table number is required');
    }

    const user = await this.userModel
      .findOne({ tableNumber: dto.tableNumber })
      .exec();

    if (user) {
      throw new BadRequestException(
        'User with this table number already exists',
      );
    }

    return await this.userModel.create(dto);
  }

  async findAll() {
    return this.userModel
      .find()
      .populate('branch')
      .populate('department')
      .exec();
  }

  async findByTableNumber(tableNumber: number) {
    return this.userModel.findOne({ tableNumber }).exec();
  }

  async findByTableNumberAndPassport(
    tableNumber: number,
    jshshir: string,
  ) {
    return this.userModel
      .findOne({ tableNumber, jshshir })
      .exec();
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate('branch')
      .populate('department')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();
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

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
