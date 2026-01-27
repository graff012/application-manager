import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  InventoryCombo,
  InventoryComboDocument,
} from './schemas/inventory-combo.schema';
import { CreateInventoryComboDto } from './dto/create-inventory-combo.dto';
import { UpdateInventoryComboDto } from './dto/update-inventory-combo.dto';

@Injectable()
export class InventoryCombosService {
  constructor(
    @InjectModel(InventoryCombo.name)
    private readonly comboModel: Model<InventoryComboDocument>,
  ) {}

  async create(dto: CreateInventoryComboDto, imageUrl?: string, userId?: string) {
    try {
      const data: any = { ...dto };
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }
      data.user = userId;
      if (imageUrl) {
        data.image = imageUrl;
      }
      const created = await this.comboModel.create(data);
      return this.findOne(created._id.toString());
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create inventory combo',
      );
    }
  }

  async findAll(filter: { status?: string; search?: string } = {}) {
    try {
      const query: any = {};

      if (filter.status) {
        query.status = filter.status;
      }

      if (filter.search) {
        query.name = { $regex: filter.search, $options: 'i' };
      }

      return await this.comboModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate('devices')
        .populate('user')
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch inventory combos',
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Combo ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid combo ID format');
    }
    try {
      const combo = await this.comboModel
        .findById(id)
        .populate('devices')
        .populate('user')
        .exec();
      if (!combo) throw new NotFoundException('Inventory combo not found');
      return combo;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch inventory combo');
    }
  }

  async update(id: string, dto: UpdateInventoryComboDto, imageUrl?: string) {
    if (!id) {
      throw new BadRequestException('Combo ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid combo ID format');
    }
    try {
      const data: any = { ...dto };
      if (imageUrl) {
        data.image = imageUrl;
      }
      const combo = await this.comboModel
        .findByIdAndUpdate(id, data, { new: true })
        .populate('devices')
        .populate('user')
        .exec();
      if (!combo) throw new NotFoundException('Inventory combo not found');
      return combo;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to update inventory combo',
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Combo ID is required');
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid combo ID format');
    }
    try {
      const result = await this.comboModel.findByIdAndDelete(id).exec();
      if (!result) throw new NotFoundException('Inventory combo not found');
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to delete inventory combo',
      );
    }
  }
}
