import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { TelegramService } from '../telegram/telegram.service';
import { ConfigService } from '@nestjs/config';
import { EmployeeGateway } from '../employees/employee.gateway';
import { ToolsService } from '../tools/tools.service';
import { CompleteApplicationDto } from './dto/complete-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private appModel: Model<ApplicationDocument>,
    private readonly telegram: TelegramService,
    private readonly config: ConfigService,
    private readonly employeeGateway: EmployeeGateway,
    private readonly toolsService: ToolsService,
  ) {}

  private async generateIndex(): Promise<string> {
    try {
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
    } catch (error) {
      this.handleError(error, 'Failed to generate application index.');
    }
  }

  async create(dto: CreateApplicationDto, imageUrls: string[]) {
    try {
      const index = await this.generateIndex();
      const created = await this.appModel.create({
        ...dto,
        index,
        images: imageUrls,
        history: [],
      });
      const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
      if (chatId && /^-?\d+$/.test(chatId)) {
        await this.telegram.sendMessage(
          chatId,
          `Application ${index} created with issue: ${created.issue}.`,
        );
      }
      const populated = await this.appModel
        .findById(created._id)
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

      // WebSocket notification to all employees/admins
      this.employeeGateway.broadcastNewApplication({
        applicationId: created._id.toString(),
        index,
        issue: created.issue,
        createdAt: new Date(),
      });

      return populated ?? created;
    } catch (error) {
      this.handleError(error, 'Failed to create application.');
    }
  }

  findAll(filter: any = {}, pagination?: { limit?: number; offset?: number }) {
    try {
      const query = this.appModel
        .find(filter)
        .populate('user')
        .populate('branch')
        .populate('department')
        .populate('assignedTo')
        .populate('inventory')
        .populate({
          path: 'history.changedBy',
          select: 'fullName',
        });

      if (pagination?.offset !== undefined) {
        query.skip(pagination.offset);
      }

      if (pagination?.limit !== undefined) {
        query.limit(pagination.limit);
      }

      return query.exec();
    } catch (error) {
      this.handleError(error, 'Failed to load applications.');
    }
  }

  async countByStatus(filter: any = {}) {
    try {
      const results = await this.appModel
        .aggregate<{ _id: ApplicationStatus; count: number }>([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
        .exec();

      const counts: Record<ApplicationStatus, number> = {
        new: 0,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
      };

      for (const result of results) {
        if (result._id in counts) {
          counts[result._id] = result.count;
        }
      }

      return counts;
    } catch (error) {
      this.handleError(error, 'Failed to load application status counts.');
    }
  }

  async findOne(id: string) {
    try {
      const app = await this.appModel
        .findById(id)
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
    } catch (error) {
      this.handleError(error, 'Failed to load application.');
    }
  }

  async findByUser(userId: string) {
    try {
      return await this.appModel
        .find({ user: userId })
        .populate('assignedTo')
        .populate('inventory')
        .populate({
          path: 'history.changedBy',
          select: 'fullName',
        })
        .exec();
    } catch (error) {
      this.handleError(error, 'Failed to load user applications.');
    }
  }

  async findByEmployee(employeeId: any) {
    try {
      return await this.appModel
        .find({ assignedTo: employeeId })
        .populate('user')
        .populate('branch')
        .populate('department')
        .exec();
    } catch (error) {
      this.handleError(error, 'Failed to load employee applications.');
    }
  }

  async updateApplication(id: string, dto: CreateApplicationDto) {
    try {
      const updated = await this.appModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();
      if (!updated) throw new NotFoundException('Application not found');
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to update application.');
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      const updated = await this.appModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .exec();
      if (!updated) throw new NotFoundException('Application not found');
      const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
      if (chatId && /^-?\d+$/.test(chatId)) {
        await this.telegram.sendMessage(
          chatId,
          `Application ${updated.index} status updated to ${status}.`,
        );
      }
      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to update application status.');
    }
  }

  async assignToEmployees(
    applicationId: string,
    employees: Array<{ id: string; name: string }>,
    deadline: Date,
  ) {
    try {
      const app = await this.appModel.findById(applicationId).exec();
      if (!app) throw new NotFoundException('Application not found');

      const employeeObjectIds = employees.map((e) => new Types.ObjectId(e.id));
      const employeeNames = employees.map((e) => e.name).join(', ');

      app.assignedTo = employeeObjectIds;
      app.status = 'accepted';
      app.deadline = deadline;
      app.history.push({
        status: 'accepted',
        changedBy: employeeObjectIds[0],
        changedByModel: 'Employee',
        changedAt: new Date(),
        comment: `Assigned to ${employeeNames}, deadline: ${deadline.toISOString()}`,
      });

      await app.save();

      // WebSocket notification for each employee
      for (const employee of employees) {
        this.employeeGateway.broadcastAppAssigned({
          applicationId: app._id.toString(),
          employeeId: employee.id,
          employeeName: employee.name,
        });
      }

      // Telegram notification
      await this.telegram.sendTestNotification(
        `Application ${app.index} assigned to ${employeeNames}`,
      );

      return app;
    } catch (error) {
      this.handleError(error, 'Failed to assign application.');
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    newStatus: string,
    employeeId: string,
    employeeName: string,
    comment?: string,
  ): Promise<ApplicationDocument>;
  async updateApplicationStatus(
    applicationId: string,
    newStatus: string,
    actor: { id: string; name: string; model: 'Employee' | 'Admin' },
    comment?: string,
  ): Promise<ApplicationDocument>;
  async updateApplicationStatus(
    applicationId: string,
    newStatus: string,
    actorOrEmployeeId:
      | string
      | { id: string; name: string; model: 'Employee' | 'Admin' },
    employeeNameOrComment?: string,
    comment?: string,
  ) {
    try {
      const actor =
        typeof actorOrEmployeeId === 'string'
          ? {
              id: actorOrEmployeeId,
              name: employeeNameOrComment ?? 'Unknown',
              model: 'Employee' as const,
            }
          : actorOrEmployeeId;
      const resolvedComment =
        typeof actorOrEmployeeId === 'string' ? comment : employeeNameOrComment;
      const app = await this.appModel.findById(applicationId).exec();
      if (!app) throw new NotFoundException('Application not found');

      const trimmedComment = resolvedComment?.trim();

      if (newStatus === 'rejected' && !trimmedComment) {
        throw new BadRequestException('Rejection requires a comment (reason).');
      }

      const actorObjectId = new Types.ObjectId(actor.id);
      app.status = newStatus as any;
      app.history.push({
        status: newStatus,
        changedBy: actorObjectId,
        changedByModel: actor.model,
        changedAt: new Date(),
        comment: trimmedComment || `Status changed by ${actor.name}`,
      });

      await app.save();

      // WebSocket notification
      this.employeeGateway.broadcastStatusChanged({
        applicationId: app._id.toString(),
        newStatus,
        changedBy: actor.name,
        timestamp: new Date(),
        employeeId: actor.id,
      });

      // Telegram notification
      await this.telegram.sendTestNotification(
        `Application ${app.index} status changed to ${newStatus} by ${actor.name}`,
      );

      return app;
    } catch (error) {
      this.handleError(error, 'Failed to update application status.');
    }
  }

  async extendDeadline(
    applicationId: string,
    newDeadline: Date,
    reason: string,
    employeeId: string,
    employeeName: string,
  ) {
    try {
      const app = await this.appModel.findById(applicationId).exec();
      if (!app) throw new NotFoundException('Application not found');

      if (app.status !== 'inProgress') {
        throw new BadRequestException(
          'Deadline can only be extended when status is inProgress',
        );
      }

      const oldDeadline = app.deadline;
      const employeeObjectId = new Types.ObjectId(employeeId);

      app.deadline = newDeadline;
      app.history.push({
        status: app.status,
        changedBy: employeeObjectId,
        changedByModel: 'Employee',
        changedAt: new Date(),
        comment: `Deadline extended from ${oldDeadline?.toISOString() || 'none'} to ${newDeadline.toISOString()}. Reason: ${reason}`,
      });

      await app.save();

      // Telegram notification
      await this.telegram.sendTestNotification(
        `Application ${app.index} deadline extended by ${employeeName}. Reason: ${reason}`,
      );

      return app;
    } catch (error) {
      this.handleError(error, 'Failed to extend deadline.');
    }
  }

  async completeApplication(
    applicationId: string,
    dto: CompleteApplicationDto,
    imageUrls: string[],
    employeeId: string,
    employeeName: string,
  ) {
    try {
      const app = await this.appModel.findById(applicationId).exec();
      if (!app) throw new NotFoundException('Application not found');

      if (app.status !== 'inProgress') {
        throw new BadRequestException(
          'Application can only be completed when status is inProgress',
        );
      }

      const employeeObjectId = new Types.ObjectId(employeeId);

      // Deduct used tools from inventory
      if (dto.usedTools && dto.usedTools.length > 0) {
        for (const usedTool of dto.usedTools) {
          const tool = await this.toolsService.findOne(usedTool.tool);
          const available = (tool.quantity ?? 0) - (tool.writtenOff ?? 0);

          if (usedTool.quantity > available) {
            throw new BadRequestException(
              `Not enough quantity for tool "${tool.name}". Available: ${available}, Requested: ${usedTool.quantity}`,
            );
          }

          // Increase writtenOff count
          await this.toolsService.update(usedTool.tool, {
            writtenOff: (tool.writtenOff ?? 0) + usedTool.quantity,
          });
        }
      }

      // Set completion report
      app.completionReport = {
        workDone: dto.workDone,
        usedTools: dto.usedTools?.map((ut) => ({
          tool: new Types.ObjectId(ut.tool),
          quantity: ut.quantity,
        })),
        otherTools: dto.otherTools,
        images: imageUrls,
        completedAt: new Date(),
        completedBy: employeeObjectId,
      };

      app.status = 'completed';
      app.history.push({
        status: 'completed',
        changedBy: employeeObjectId,
        changedByModel: 'Employee',
        changedAt: new Date(),
        comment: `Completed. Work done: ${dto.workDone}`,
      });

      await app.save();

      // WebSocket notification
      this.employeeGateway.broadcastStatusChanged({
        applicationId: app._id.toString(),
        newStatus: 'completed',
        changedBy: employeeName,
        timestamp: new Date(),
        employeeId,
      });

      // Telegram notification
      await this.telegram.sendTestNotification(
        `Application ${app.index} completed by ${employeeName}`,
      );

      return app;
    } catch (error) {
      this.handleError(error, 'Failed to complete application.');
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException(message);
  }
}
