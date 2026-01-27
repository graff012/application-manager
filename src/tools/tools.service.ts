import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tool, ToolDocument } from './schemas/tool.schema';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { DeductToolDto } from './dto/deduct-tool.dto';

@Injectable()
export class ToolsService {
  constructor(
    @InjectModel(Tool.name) private readonly toolModel: Model<ToolDocument>,
  ) {}

  async create(dto: CreateToolDto) {
    if (
      !dto.name ||
      !dto.tags?.length ||
      dto.quantity === undefined ||
      !dto.toolNumber
    ) {
      throw new BadRequestException(
        'name, tags, quantity, toolNumber are required',
      );
    }

    const existingByToolNumber = await this.toolModel
      .findOne({ toolNumber: dto.toolNumber })
      .exec();

    if (existingByToolNumber)
      throw new BadRequestException('this tool Number already exists');

    const existingByName = await this.toolModel
      .findOne({ name: dto.name })
      .exec();

    if (existingByName)
      throw new BadRequestException('This tool name already exists');

    return this.toolModel.create(dto);
  }

  findAll(filter: { status?: string; search?: string } = {}) {
    const query: any = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { toolNumber: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return this.toolModel.find(query).sort({ createdAt: -1 }).populate('tags').exec();
  }

  async findOne(id: string) {
    const tool = await this.toolModel
      .findOne({ _id: id })
      .populate('tags')
      .exec();
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  // the number of specific tool.
  async countOne(id: string) {
    const tool = await this.toolModel.findById(id).exec();

    if (!tool) throw new NotFoundException('tool not found');

    const total = tool.quantity ?? 0;
    const writtenOff = tool.writtenOff ?? 0;

    return {
      toolId: tool._id,
      name: tool.name,
      toolNumber: tool.toolNumber,
      total,
      writtenOff,
      available: Math.max(total - writtenOff, 0),
    };
  }

  // the number of tool, but count by tag
  async countByTag(tagId: string) {
    const tools = await this.toolModel.find({ tags: tagId }).exec();

    return tools.map((t) => ({
      toolId: t._id,
      name: t.name,
      total: t.quantity ?? 0,
      writtenOff: t.writtenOff ?? 0,
      available: Math.max((t.quantity ?? 0) - (t.writtenOff ?? 0), 0),
    }));
  }

  async update(id: string, dto: UpdateToolDto) {
    const tool = await this.toolModel
      .findOneAndUpdate({ _id: id }, dto, { new: true })
      .populate('tags')
      .exec();
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async deduct(
    id: string,
    dto: DeductToolDto,
    actor?: { id: string; model: 'Employee' | 'Admin' },
  ) {
    if (!actor?.id || !actor?.model) {
      throw new BadRequestException('Deduction requires an actor');
    }

    const existing = await this.toolModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Tool not found');

    if (existing.status === 'inactive') {
      throw new BadRequestException('Tool is already inactive');
    }

    const historyEntry = {
      action: 'deducted',
      by: new Types.ObjectId(actor.id),
      byModel: actor.model,
      at: new Date(),
      comment: dto.comment,
      reason: dto.reason,
    };

    const updated = await this.toolModel
      .findByIdAndUpdate(
        id,
        {
          status: 'inactive',
          $push: { history: historyEntry },
        },
        { new: true },
      )
      .populate('tags')
      .exec();

    return updated;
  }

  async remove(id: string) {
    const res = await this.toolModel.deleteOne({ _id: id }).exec();
    if (!res.deletedCount) throw new NotFoundException('Tool not found');
    return { deleted: true };
  }

  async findByTag(tagId: string) {
    return this.toolModel.find({ tags: tagId }).sort({ createdAt: -1 }).populate('tags').exec();
  }
}
