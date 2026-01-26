import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
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
    const branch = await this.branchModel.findOne({ name: dto.name }).exec();
    if (branch) {
      throw new ConflictException('Branch with this name already exists');
    }

    return this.branchModel.create(dto);
  }

  findAll(filter: { status?: string; search?: string } = {}) {
    const query: any = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      query.name = { $regex: filter.search, $options: 'i' };
    }

    return this.branchModel.find(query).sort({ createdAt: -1 }).exec();
  }

  findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Branch id is required');
    }
    return this.branchModel.findById(id).exec();
  }

  update(id: string, dto: CreateBranchDto) {
    if (!id) {
      throw new BadRequestException('Branch id is required');
    }
    return this.branchModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string) {
    if (!id) {
      throw new BadRequestException('Branch id is required');
    }
    return this.branchModel.findByIdAndDelete(id).exec();
  }
}
