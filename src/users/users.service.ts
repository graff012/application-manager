import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

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
}
