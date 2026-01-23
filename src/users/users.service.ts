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
import { UpdateProfileDto, UpdateUserDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    if (!dto.tableNumber) {
      throw new BadRequestException('Table number is required');
    }
    console.log('starting to add users');
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
    console.log('creating user');
    const user = await this.userModel.create(dto);
    console.log('user created successfully');
    return user;
  }

  async findAll(filter: {
    status?: string;
    branch?: string;
    search?: string;
  } = {}) {
    try {
      const query: any = {};

      if (filter.status) {
        query.status = filter.status;
      }

      if (filter.branch) {
        query.branch = filter.branch;
      }

      if (filter.search) {
        query.$or = [
          { fullName: { $regex: filter.search, $options: 'i' } },
          { tableNumber: { $regex: filter.search, $options: 'i' } },
        ];
      }

      const users = await this.userModel
        .find(query)
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

  async findByTableNumber(tableNumber: string) {
    return this.userModel.findOne({ tableNumber }).exec();
  }

  async findByTableNumberAndPassport(tableNumber: string, jshshir: string) {
    return this.userModel.findOne({ tableNumber, jshshir }).exec();
  }

  async getInventoryHistory(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel
      .findById(userId)
      .populate('inventoryHistory.inventory')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.inventoryHistory;
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

  // Method for regular users updating their own profile
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.gender) user.gender = dto.gender;
    if (dto.status) user.status = dto.status;

    // Mark profile as complete if both phone and gender are provided
    if (user.phone && user.gender) {
      user.profileComplete = true;
    }

    await user.save();
    return user;
  }

  // Method for admins updating any user
  async updateUser(userId: string, dto: UpdateUserDto) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    // Update all provided fields
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.branch !== undefined) user.branch = dto.branch as any;
    if (dto.department !== undefined) user.department = dto.department as any;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;

    // Mark profile as complete if both phone and gender are provided
    if (user.phone && user.gender) {
      user.profileComplete = true;
    }

    await user.save();

    // Return populated user
    return this.userModel
      .findById(userId)
      .populate('branch')
      .populate('department')
      .exec();
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('User not found');
    return { deleted: true };
  }

  async getCountUsers() {
    const result = await this.userModel.countDocuments();
    console.log('count users: ', result);

    return { result };
  }
}
