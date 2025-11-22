import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { QrCodeService } from '../common/services/qr-code.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private invModel: Model<InventoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly qrCodeService: QrCodeService,
  ) {}

  private async logUserHistory(
    userId: string | Types.ObjectId,
    inventoryId: Types.ObjectId,
    action: string,
  ) {
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

  async create(
    dto: CreateInventoryDto,
    imageUrls: string[],
    employeeId?: string,
  ) {
    // Generate QR code URL
    const qrCodeUrl = await this.qrCodeService.getQrCodeUrl(dto.inventoryNumber);
    
    const created = await this.invModel.create({
      ...dto,
      images: imageUrls,
      qrCodeUrl,
      assignedTo: dto.user,
      tags: dto.tags,
      history: [
        {
          action: 'assigned',
          by: employeeId ? new Types.ObjectId(employeeId) : dto.user,
          byModel: employeeId ? 'Employee' : 'User',
          at: new Date(),
          comment: 'Initial assignment',
        },
      ],
    });
    await this.logUserHistory(dto.user, created._id, 'assigned');
    return created;
  }

  findAll() {
    return this.invModel
      .find()
      .populate('assignedTo')
      .populate('branch')
      .populate('department')
      .populate({
        path: 'history.by',
        select: 'fullName',
      })
      .exec();
  }

  async findOne(id: string) {
    const doc = await this.invModel
      .findById(id)
      .populate('assignedTo')
      .populate('branch')
      .populate('department')
      .populate({
        path: 'history.by',
        select: 'fullName',
      })
      .exec();
    if (!doc) throw new NotFoundException('Inventory not found');
    return doc;
  }

  async findByInventoryNumber(inventoryNumber: string) {
    const item = await this.invModel
      .findOne({ inventoryNumber })
      .populate('assignedTo')
      .populate('branch')
      .populate('department')
      .exec();
    
    if (!item) {
      throw new NotFoundException(`Inventory with number ${inventoryNumber} not found`);
    }
    
    return item;
  }

  async update(
    id: string,
    dto: UpdateInventoryDto,
    imageUrls?: string[],
    employeeId?: string,
  ) {
    const existing = await this.invModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Inventory not found');

    const update: any = { ...dto };
    if (imageUrls && imageUrls.length) {
      update.images = imageUrls;
    }

    // Prepare history entry
    const historyEntry: any = {
      at: new Date(),
    };

    // Determine action based on what changed
    if (dto.user && dto.user.toString() !== existing.assignedTo?.toString()) {
      historyEntry.action = 'assigned';
      historyEntry.comment = 'Reassigned to new user';
      update.assignedTo = dto.user;
    } else if (dto['status'] && dto['status'] !== existing.status) {
      historyEntry.action = dto['status']; // 'repair', 'broken', etc.
      historyEntry.comment = `Status changed to ${dto['status']}`;
    } else {
      historyEntry.action = 'returned';
      historyEntry.comment = 'Inventory updated';
    }

    // Set who made the change
    if (employeeId) {
      historyEntry.by = new Types.ObjectId(employeeId);
      historyEntry.byModel = 'Employee';
    } else if (dto.user) {
      historyEntry.by = dto.user;
      historyEntry.byModel = 'User';
    }

    // Add history entry
    if (!update.$push) update.$push = {};
    update.$push.history = historyEntry;

    const updated = await this.invModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (dto.user && dto.user.toString() !== existing.assignedTo?.toString()) {
      await this.logUserHistory(dto.user, updated!._id, 'updated');
    }
    return updated;
  }
}
