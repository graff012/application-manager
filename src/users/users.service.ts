import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    try {
    if (!dto.tableNumber) {
      throw new BadRequestException('Table number is required');
    }

    console.log('starting to add users')

    const existingByTableNumber = await this.userModel
      .findOne({ tableNumber: dto.tableNumber })
      .exec();

    const existingByJshshir = await this.userModel
      .findOne({ jshshir: dto.jshshir })
      .exec();

    if (existingByJshshir) {
      throw new BadRequestException('User with this jshshir already exists');
    }

    if (existingByTableNumber) {
      throw new BadRequestException(
        'User with this table number already exists',
      );
    }

    console.log('user added')

    return await this.userModel.create(dto);
    } catch (err) {
      console.error('Error occured: ', err)
    }
  }

  async findAll() {
    try {
      const users = await this.userModel
        .find()
        .populate('branch')
        .populate('department')
        .exec();
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
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
      const users = await this.userModel
        .find({ branch: branchId })
        .populate('branch')
        .populate('department')
        .exec();
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users by branch');
    }
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
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    try {
      const user = await this.userModel
        .findById(id)
        .populate('branch')
        .populate('department')
        .exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
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
