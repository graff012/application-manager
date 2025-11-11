import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument } from './schemas/branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>
  ) {}

  async create(dto: CreateBranchDto) {
    try {
      return this.branchModel.create(dto);
    } catch (err) {
      if (err.code === '11000') {
        throw new ConflictException('Branch with this name already exists');
      }
    }
  }

  findAll() {
    return this.branchModel.find().exec();
  }
}
