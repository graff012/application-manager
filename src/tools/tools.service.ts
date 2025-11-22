import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tool, ToolDocument } from './schemas/tool.schema';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Injectable()
export class ToolsService {
  constructor(@InjectModel(Tool.name) private readonly toolModel: Model<ToolDocument>) {}

  create(dto: CreateToolDto) {
    return this.toolModel.create(dto);
  }

  findAll() {
    return this.toolModel.find().exec();
  }

  async findOne(id: string) {
    const tool = await this.toolModel.findOne({ _id: id }).exec();
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async update(id: string, dto: UpdateToolDto) {
    const tool = await this.toolModel
      .findOneAndUpdate({ _id: id }, dto, { new: true })
      .exec();
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async remove(id: string) {
    const res = await this.toolModel.deleteOne({ _id: id }).exec();
    if (!res.deletedCount) throw new NotFoundException('Tool not found');
    return { deleted: true };
  }
}
