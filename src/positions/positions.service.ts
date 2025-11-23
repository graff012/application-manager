import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(@InjectModel(Position.name) private positionModel: Model<PositionDocument>) {}

  create(dto: CreatePositionDto) {
    return this.positionModel.create(dto);
  }

  findAll() {
    return this.positionModel.find().exec();
  }

  async findOne(id: string) {
    const position = await this.positionModel.findById(id).exec();
    if (!position) throw new NotFoundException('Position not found');
    return position;
  }

  async update(id: string, dto: UpdatePositionDto) {
    const position = await this.positionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!position) throw new NotFoundException('Position not found');
    return position;
  }

  async remove(id: string) {
    const result = await this.positionModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Position not found');
    return { deleted: true };
  }
}
