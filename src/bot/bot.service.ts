import { Injectable } from '@nestjs/common';
process.env.NTBA_FIX_319 = String(1);
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';

import { InlineBuilder } from './inline.builder';

@Injectable()
export class BotService {
  private readonly _bot: TelegramBot;

  constructor(private readonly configService: ConfigService) {
    this._bot = new TelegramBot(configService.get<string>('BOT_TOKEN'), {
      polling: true,
    });
  }

  get bot(): TelegramBot {
    return this._bot;
  }

  async editMsg(
    txt: string,
    msg: TelegramBot.Message,
    btns: InlineBuilder,
    options?: TelegramBot.EditMessageTextOptions,
  ): Promise<TelegramBot.Message | boolean> {
    let opts: TelegramBot.EditMessageTextOptions = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      reply_markup: btns.getReplyEdit(),
      parse_mode: 'Markdown',
    };
    if (options) {
      opts = { ...opts, ...options };
    }
    return this.bot.editMessageText(txt, opts);
  }

  async editMessageReplyMarkup(
    replyMarkup: TelegramBot.InlineKeyboardMarkup,
    options?: TelegramBot.EditMessageReplyMarkupOptions,
  ): Promise<TelegramBot.Message | boolean> {
    return this._bot.editMessageReplyMarkup(replyMarkup, options);
  }

  async sendMessage(
    msg: TelegramBot.Message,
    txt: string,
    options?: TelegramBot.SendMessageOptions,
  ): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(msg.chat.id, txt, options);
  }
}
