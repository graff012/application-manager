import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tool, ToolDocument } from './schemas/tool.schema';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Injectable()
export class ToolsService {
  constructor(
    @InjectModel(Tool.name) private readonly toolModel: Model<ToolDocument>,
  ) {}

  async create(dto: CreateToolDto) {
    if (!dto.name || !dto.tagId || !dto.quantity || dto.toolNumber) {
      throw new BadRequestException(
        'name, tagId, quantity, toolNumber are required',
      );
    }

    const existingByName = await this.toolModel
      .findOne({ name: dto.name })
      .exec();

    if (existingByName) throw new BadRequestException('This tool already exists')

    return this.toolModel.create(dto);
  }

  findAll() {
    return this.toolModel.find().populate('tagId').exec();
  }

  async findOne(id: string) {
    const tool = await this.toolModel
      .findOne({ _id: id })
      .populate('tagId')
      .exec();
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async update(id: string, dto: UpdateToolDto) {
    const tool = await this.toolModel
      .findOneAndUpdate({ _id: id }, dto, { new: true })
      .populate('tagId')
      .exec();
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async remove(id: string) {
    const res = await this.toolModel.deleteOne({ _id: id }).exec();
    if (!res.deletedCount) throw new NotFoundException('Tool not found');
    return { deleted: true };
  }

  async findByTag(tagId: string) {
    return this.toolModel.find({ tagId }).populate('tagId').exec();
  }
}
