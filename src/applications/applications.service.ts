import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { TelegramService } from '../telegram/telegram.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private appModel: Model<ApplicationDocument>,
    private readonly telegram: TelegramService,
    private readonly config: ConfigService,
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
    const created = await this.appModel.create({ ...dto, index, images: imageUrls });
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
    if (chatId && /^-?\d+$/.test(chatId)) {
      await this.telegram.sendMessage(
        chatId,
        `Application ${index} created with issue: ${created.issue}.`,
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
      .exec();
  }

  async updateStatus(id: string, status: string) {
    const updated = await this.appModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (updated) {
      const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
      if (chatId && /^-?\d+$/.test(chatId)) {
        await this.telegram.sendMessage(
          chatId,
          `Application ${updated.index} status updated to ${status}.`,
        );
      }
    }
    return updated;
  }
}
