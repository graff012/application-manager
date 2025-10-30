import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }
    this.bot = new Telegraf(token);
  }

  async sendMessage(chatId: string | number, text: string) {
    return this.bot.telegram.sendMessage(chatId, text);
  }

  async sendTestNotification(message: string) {
    // For testing: All notifications go to chat ID 1391380244
    const testChatId = this.config.get<string>('TELEGRAM_CHAT_ID') || '1391380244';
    return this.bot.telegram.sendMessage(testChatId, message);
  }
}
