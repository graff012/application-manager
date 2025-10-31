import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { TelegramService } from '../telegram/telegram.service';
import { ConfigService } from '@nestjs/config';
import { EmployeeGateway } from '../employees/employee.gateway';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private appModel: Model<ApplicationDocument>,
    private readonly telegram: TelegramService,
    private readonly config: ConfigService,
    private readonly employeeGateway: EmployeeGateway
  ) {}

  private async generateIndex(): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.appModel
      .findOne({ index: { $regex: `-${year}$` } })
      .sort({ createdAt: -1 })
      .exec();
    let nextNum = 1;
    if (last) {
      const [numStr] = last.index.split('-');
      nextNum = parseInt(numStr, 10) + 1;
    }
    const padded = String(nextNum).padStart(5, '0');
    return `${padded}-${year}`;
  }

  async create(dto: CreateApplicationDto, imageUrls: string[]) {
    const index = await this.generateIndex();
    const created = await this.appModel.create({
      ...dto,
      index,
      images: imageUrls,
      history: [
        {
          status: 'new',
          changedBy: dto.user,
          changedByModel: 'User',
          changedAt: new Date(),
          comment: 'Ariza yaratildi',
        },
      ],
    });
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
    if (chatId && /^-?\d+$/.test(chatId)) {
      await this.telegram.sendMessage(
        chatId,
        `Application ${index} created with issue: ${created.issue}.`
      );
    }
    return created;
  }

  findAll(filter: any = {}) {
    return this.appModel
      .find(filter)
      .populate('user')
      .populate('branch')
      .populate('department')
      .populate('assignedTo')
      .populate('inventory')
      .populate({
        path: 'history.changedBy',
        select: 'fullName',
      })
      .exec();
  }

  async findOne(id: string) {
    const app = await this.appModel
      .findOne({ id })
      .populate('user')
      .populate('branch')
      .populate('department')
      .populate('assignedTo')
      .populate('inventory')
      .populate({
        path: 'history.changedBy',
        select: 'fullName',
      })
      .exec();
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async findByUser(userId: string) {
    return this.appModel
      .find({ user: userId })
      .populate('assignedTo')
      .populate('inventory')
      .populate({
        path: 'history.changedBy',
        select: 'fullName',
      })
      .exec();
  }

  async findByEmployee(employeeId: any) {
    return this.appModel
      .find({ assignedTo: employeeId })
      .populate('user')
      .populate('branch')
      .populate('department')
      .exec();
  }

  async updateStatus(id: string, status: string) {
    const updated = await this.appModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (updated) {
      const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
      if (chatId && /^-?\d+$/.test(chatId)) {
        await this.telegram.sendMessage(
          chatId,
          `Application ${updated.index} status updated to ${status}.`
        );
      }
    }
    return updated;
  }

  async assignToEmployee(
    applicationId: string,
    employeeId: string,
    employeeName: string
  ) {
    const app = await this.appModel.findOne({ id: applicationId }).exec();
    if (!app) throw new NotFoundException('Application not found');

    const employeeObjectId = new Types.ObjectId(employeeId);
    app.assignedTo = employeeObjectId;
    app.status = 'assigned';
    app.history.push({
      status: 'assigned',
      changedBy: employeeObjectId,
      changedByModel: 'Employee',
      changedAt: new Date(),
      comment: `Assigned to ${employeeName}`,
    });

    await app.save();

    // WebSocket notification
    this.employeeGateway.broadcastAppAssigned({
      applicationId: app.id,
      employeeId,
      employeeName,
    });

    // Telegram notification
    await this.telegram.sendTestNotification(
      `Application ${app.index} assigned to ${employeeName}`
    );

    return app;
  }

  async updateApplicationStatus(
    applicationId: string,
    newStatus: string,
    employeeId: string,
    employeeName: string
  ) {
    const app = await this.appModel.findOne({ id: applicationId }).exec();
    if (!app) throw new NotFoundException('Application not found');

    const employeeObjectId = new Types.ObjectId(employeeId);
    app.status = newStatus as any;
    app.history.push({
      status: newStatus,
      changedBy: employeeObjectId,
      changedByModel: 'Employee',
      changedAt: new Date(),
      comment: `Status changed by ${employeeName}`,
    });

    await app.save();

    // WebSocket notification
    this.employeeGateway.broadcastStatusChanged({
      applicationId: app.id,
      newStatus,
      changedBy: employeeName,
      timestamp: new Date(),
    });

    // Telegram notification
    await this.telegram.sendTestNotification(
      `Application ${app.index} status changed to ${newStatus} by ${employeeName}`
    );

    return app;
  }
}
