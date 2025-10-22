import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument } from './schemas/branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<BranchDocument>) {}

  create(dto: CreateBranchDto) {
    return this.branchModel.create(dto);
  }

  findAll() {
    return this.branchModel.find().exec();
  }
}
