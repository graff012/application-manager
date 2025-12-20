// src/inventory/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto, UsedToolDto } from './dto/update-inventory.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { QrCodeService } from '../common/services/qr-code.service';
import { Tool, ToolDocument } from '../tools/schemas/tool.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly invModel: Model<InventoryDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Tool.name)
    private readonly toolModel: Model<ToolDocument>,
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
    const qrCodeUrl = await this.qrCodeService.getQrCodeUrl(
      dto.inventoryNumber,
    );

    let assignedTo: Types.ObjectId | undefined;
    let assignedToModel: 'User' | 'Employee' | undefined;
    let assignedAt: Date | undefined;

    if (dto.user) {
      assignedTo = new Types.ObjectId(dto.user);
      assignedToModel = 'User';
      assignedAt = new Date();
    } else if (employeeId) {
      assignedTo = new Types.ObjectId(employeeId);
      assignedToModel = 'Employee';
      assignedAt = new Date();
    }

    const history: any[] = [];
    if (assignedTo) {
      history.push({
        action: 'assigned',
        by: employeeId ? new Types.ObjectId(employeeId) : assignedTo,
        byModel: employeeId ? 'Employee' : assignedToModel,
        at: new Date(),
        comment: 'Initial assignment',
      });
    }

    const created = await this.invModel.create({
      ...dto,
      images: imageUrls,
      qrCodeUrl,
      assignedTo,
      assignedToModel,
      assignedAt,
      tags: dto.tags,
      history,
    });

    if (dto.user) {
      await this.logUserHistory(dto.user, created._id, 'assigned');
    }
    return created;
  }

  findAll() {
    return (
      this.invModel
        .find()
        .populate('assignedTo')
        .populate('branch')
        .populate('department')
        .populate({
          path: 'history.by',
          select: 'fullName',
        })
        // if you later want to populate used tools:
        // .populate('history.usedTools.tool')
        .exec()
    );
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
      // .populate('history.usedTools.tool')
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
      throw new NotFoundException(
        `Inventory with number ${inventoryNumber} not found`,
      );
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
      update.assignedTo = new Types.ObjectId(dto.user);
      update.assignedToModel = 'User';
      update.assignedAt = new Date();
    } else if (dto.status && dto.status !== existing.status) {
      // status came from your UpdateInventoryDto
      historyEntry.action = dto.status; // 'repair', 'broken', etc.
      historyEntry.comment = `Status changed to ${dto.status}`;
    } else {
      historyEntry.action = 'returned';
      historyEntry.comment = 'Inventory updated';
    }

    // Who made the change
    if (employeeId) {
      historyEntry.by = new Types.ObjectId(employeeId);
      historyEntry.byModel = 'Employee';
    } else if (dto.user) {
      historyEntry.by = dto.user;
      historyEntry.byModel = 'User';
    }

    /**
     * If repair uses tools, write them off from warehouse
     * and store them in historyEntry.usedTools + writeOffReason
     */
    if (dto.usedTools && dto.usedTools.length) {
      historyEntry.usedTools = dto.usedTools.map((ut: UsedToolDto) => ({
        tool: new Types.ObjectId(ut.tool),
        quantity: ut.quantity,
      }));

      if (dto.writeOffReason) {
        historyEntry.writeOffReason = dto.writeOffReason;
      }

      for (const ut of dto.usedTools) {
        const tool = await this.toolModel.findById(ut.tool).exec();
        if (!tool) {
          throw new NotFoundException(`Tool ${ut.tool} not found`);
        }

        const available = tool.quantity - tool.writtenOff;
        if (available < ut.quantity) {
          throw new Error(
            `Not enough stock for tool ${tool.name}. Available: ${available}, requested: ${ut.quantity}`,
          );
        }

        await this.toolModel.updateOne(
          { _id: ut.tool },
          { $inc: { writtenOff: ut.quantity } },
        );
      }
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
