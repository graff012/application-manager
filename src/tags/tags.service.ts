import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>) {}

  create(dto: CreateTagDto) {
    return this.tagModel.create(dto);
  }

  findAll() {
    return this.tagModel.find().exec();
  }

  async findOne(id: string) {
    const tag = await this.tagModel.findOne({ _id: id }).exec();
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.tagModel
      .findOneAndUpdate({ _id: id }, dto, { new: true })
      .exec();
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async remove(id: string) {
    const res = await this.tagModel.deleteOne({ _id: id }).exec();
    if (!res.deletedCount) throw new NotFoundException('Tag not found');
    return { deleted: true };
  }
}
