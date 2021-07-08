import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TelegramBot from 'node-telegram-bot-api';
import { Cache } from 'cache-manager';

import { IUser } from './contracts/iUser';
import { User } from './entities/user.entity';
import { BotService } from '../bot/bot.service';
import { InlineBuilder } from '../bot/inline.builder';
import { Tools } from '../utils/tools';
import { TBotCbUser } from './types/tBotCbUser';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  private static USER_KEY = 'userKey';
  private static UPDATE_DATA_KEY = 'updateData';
  private static LIST_LENGTH = 8;

  private static DEFAULT_BTNS = [
    'Btn1',
    'Btn2',
    'Btn3',
    'Btn4',
    'Btn5',
    'Btn6',
    'Btn7',
    'Btn8',
  ];

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<IUser>,
    private readonly botService: BotService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    this.initBotListening();
  }

  initBotListening() {
    this.botService.bot.onText(/^\/start/, async (msg) => this.start(msg));
    this.botService.bot.onText(/^\/list/, async (msg) =>
      this.sendListBtns(msg),
    );
    this.botService.bot.on('callback_query', async (q) => this.cbQuery(q));
  }

  async cbQuery(query: TelegramBot.CallbackQuery): Promise<void> {
    if (!query?.data) {
      return;
    }
    const params = Tools.parseCbParams<TBotCbUser>(query.data);
    if (params?.t !== 'u') {
      return;
    }
    this.logger.log('Call on TelegramBot.CallbackQuery');

    if (params?.u === 'pag' && params?.page) {
      await this.pagination(params.page);
      return;
    }
  }

  async start(msg: TelegramBot.Message) {
    const model = await this.repository.findOne({ tgId: msg.chat.id });
    if (model) {
      await this.sendListBtns(msg);
      return;
    }
    await this.createUserAndSendListBtns(msg);
  }

  async sendListBtns(msg: TelegramBot.Message): Promise<void> {
    const btns = new InlineBuilder();
    this.buildList(btns, UsersService.DEFAULT_BTNS);
    const res = await this.botService.sendMessage(
      msg,
      `Header`,
      btns.getReply(),
    );
    await this.cacheManager.set(UsersService.USER_KEY, JSON.stringify(res));
  }

  async updateListBtns(arr: string[]): Promise<void> {
    if (!Array.isArray(arr) || !arr.length) {
      throw new Error('Bad update data');
    }
    await this.cacheManager.set(
      UsersService.UPDATE_DATA_KEY,
      JSON.stringify(arr),
    );

    const msg = await this.getMsgByCache();

    const countArr = arr.length;
    arr.splice(UsersService.LIST_LENGTH);
    const btns = new InlineBuilder();
    this.buildList(btns, arr);
    if (countArr > UsersService.LIST_LENGTH) {
      btns.addButton({
        text: `1 / ${Math.ceil(countArr / UsersService.LIST_LENGTH)}`,
        callback_data: 'progress',
      });
      btns.addButton({
        text: `➡`,
        callback_data: Tools.stringifyCbParams<TBotCbUser>({
          t: 'u',
          u: 'pag',
          page: 2,
        }),
      });
    }
    await this.botService.editMessageReplyMarkup(btns.getReplyEdit(), {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    });
  }

  async getMsgByCache(): Promise<TelegramBot.Message> {
    const user = (await this.cacheManager.get(UsersService.USER_KEY)) as string;
    if (!user) {
      throw new Error('User not found by cache');
    }
    return Tools.parseCbParams<TelegramBot.Message>(user);
  }

  async pagination(page = 1): Promise<void> {
    if (!(typeof page === 'number') || page < 1) {
      this.logger.error('Pagination: invalid param');
      return;
    }
    const msg = await this.getMsgByCache();
    const data = (await this.cacheManager.get(
      UsersService.UPDATE_DATA_KEY,
    )) as string;
    if (!data) {
      throw new Error('Array not found by cache');
    }
    const arr = Tools.parseCbParams<string[]>(data);

    const countArr = arr.length;
    const list = arr.slice(
      UsersService.LIST_LENGTH * (page - 1),
      UsersService.LIST_LENGTH * page,
    );
    const btns = new InlineBuilder();
    this.buildList(btns, list);
    if (countArr > UsersService.LIST_LENGTH) {
      const total = Math.ceil(countArr / UsersService.LIST_LENGTH);
      btns.addButton({
        text: `⬅`,
        callback_data: Tools.stringifyCbParams<TBotCbUser>({
          t: 'u',
          u: 'pag',
          page: page - 1,
        }),
      });
      btns.addButton({
        text: `${page} / ${total}`,
        callback_data: 'progress',
      });
      if (page !== total) {
        btns.addButton({
          text: `➡`,
          callback_data: Tools.stringifyCbParams<TBotCbUser>({
            t: 'u',
            u: 'pag',
            page: page + 1,
          }),
        });
      }
    }
    await this.botService.editMessageReplyMarkup(btns.getReplyEdit(), {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    });
  }

  async createUserAndSendListBtns(msg: TelegramBot.Message): Promise<void> {
    await this.repository.save(
      this.repository.create({
        tgId: msg.chat.id,
        name: msg.chat.first_name,
      }),
    );
    await this.sendListBtns(msg);
  }

  buildList(btns: InlineBuilder, list: string[]) {
    list.forEach((b, i) => {
      btns.addButton({
        text: b,
        callback_data: Tools.stringifyCbParams<TBotCbUser>({
          t: 'u',
          u: 'cmd',
          d: `btn-${i + 1}`,
        }),
      });
      btns.nextLine();
    });
  }
}
