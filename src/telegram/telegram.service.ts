import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private bot?: Telegraf;
  private readonly logger = new Logger(TelegramService.name);
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not set. Telegram notifications are disabled.');
      this.enabled = false;
      return;
    }
    this.bot = new Telegraf(token);
    this.enabled = true;
  }

  async sendMessage(chatId: string | number, text: string) {
    if (!this.enabled || !this.bot) {
      this.logger.debug?.('sendMessage called but Telegram is disabled');
      return;
    }

    try {
      return await this.bot.telegram.sendMessage(chatId, text);
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error as any);
    }
  }

  async sendTestNotification(message: string) {
    if (!this.enabled || !this.bot) {
      this.logger.debug?.('sendTestNotification called but Telegram is disabled');
      return;
    }

    const testChatId = this.config.get<string>('TELEGRAM_CHAT_ID');
    if (!testChatId) {
      this.logger.warn('TELEGRAM_CHAT_ID is not set. Skipping test notification.');
      return;
    }

    try {
      return await this.bot.telegram.sendMessage(testChatId, message);
    } catch (error) {
      this.logger.error('Failed to send Telegram test notification', error as any);
    }
  }
}
