import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private invModel: Model<InventoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async logUserHistory(userId: string | Types.ObjectId, inventoryId: Types.ObjectId, action: string) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $push: {
          inventoryHistory: {
            inventory: inventoryId,
            action,
            timestamp: new Date(),
          },
        },
      },
    );
  }

  async create(dto: CreateInventoryDto, imageUrls: string[]) {
    const created = await this.invModel.create({ ...dto, images: imageUrls });
    await this.logUserHistory(dto.user, created._id, 'assigned');
    return created;
  }

  findAll() {
    return this.invModel
      .find()
      .populate('user')
      .populate('branch')
      .populate('department')
      .exec();
  }

  async findOne(id: string) {
    const doc = await this.invModel
      .findById(id)
      .populate('user')
      .populate('branch')
      .populate('department')
      .exec();
    if (!doc) throw new NotFoundException('Inventory not found');
    return doc;
  }

  async update(id: string, dto: UpdateInventoryDto, imageUrls?: string[]) {
    const existing = await this.invModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Inventory not found');

    const update: any = { ...dto };
    if (imageUrls && imageUrls.length) {
      update.images = imageUrls;
    }

    const updated = await this.invModel.findByIdAndUpdate(id, update, { new: true }).exec();

    if (dto.user) {
      await this.logUserHistory(dto.user, updated!._id, 'updated');
    }
    return updated;
  }
}
