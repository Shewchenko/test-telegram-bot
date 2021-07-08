import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Cache } from 'cache-manager';
import TelegramBot from 'node-telegram-bot-api';
import { CACHE_MANAGER } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { UsersService } from './users.service';
import { ImportDbMock } from '../mocks/db/importDbMock';
import { BotService } from '../bot/bot.service';
import { CacheMock } from '../mocks/cacheMock';
import { InlineBuilder } from '../bot/inline.builder';

describe('UsersService', () => {
  let service: UsersService;
  let botService: BotService;
  let cache: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              BOT_TOKEN: 'test',
            }),
          ],
        }),
        ...ImportDbMock.get(),
      ],
      providers: [
        UsersService,
        BotService,
        {
          provide: CACHE_MANAGER,
          useClass: CacheMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    botService = module.get<BotService>(BotService);
    cache = module.get<CacheMock>(CACHE_MANAGER);
  });

  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendListBtns', () => {
    it('call method', async () => {
      botService.sendMessage = jest.fn();
      cache.set = jest.fn();
      await service.sendListBtns({
        chat: { id: 1 },
        message_id: 10,
      } as TelegramBot.Message);
      expect(botService.sendMessage).toMatchSnapshot();
      expect(cache.set).toMatchSnapshot();
    });
  });

  describe('getMsgByCache', () => {
    it('User not found by cache', async () => {
      expect.assertions(1);
      cache.get = jest.fn().mockReturnValue(undefined);
      try {
        await service.getMsgByCache();
      } catch (e) {
        expect(e.message).toBe('User not found by cache');
      }
    });
    it('success', async () => {
      expect.assertions(1);
      const msg = { chat: { id: 1 }, message_id: 1 } as TelegramBot.Message;
      cache.get = jest.fn().mockReturnValue(JSON.stringify(msg));
      const res = await service.getMsgByCache();
      expect(res).toEqual(msg);
    });
  });

  describe('updateListBtns', () => {
    it('Array is empty', async () => {
      expect.assertions(1);
      try {
        await service.updateListBtns([]);
      } catch (e) {
        expect(e.message).toBe('Bad update data');
      }
    });
    it('List less 9', async () => {
      cache.set = jest.fn();
      cache.get = jest
        .fn()
        .mockReturnValue(`{"chat": { "id": 1 }, "message_id": 1}`);
      botService.editMessageReplyMarkup = jest.fn();
      await service.updateListBtns(['1', '2']);
      expect(botService.editMessageReplyMarkup).toMatchSnapshot();
    });
    it('List more 9', async () => {
      cache.set = jest.fn();
      cache.get = jest
        .fn()
        .mockReturnValue(`{"chat": { "id": 1 }, "message_id": 1}`);
      botService.editMessageReplyMarkup = jest.fn();
      await service.updateListBtns([
        'btn',
        'btn',
        'btn',
        'btn',
        'btn',
        'btn',
        'btn',
        'btn',
        'btn',
        'btn',
      ]);
      expect(botService.editMessageReplyMarkup).toMatchSnapshot();
    });
  });

  describe('buildList', () => {
    it.each([
      [['name1', 'name2', 'name3', 'name4']],
      [['name1', 'name2', 'name3']],
      [['name1', 'name2']],
      [['name1']],
    ])(`List: %s`, async (arr) => {
      const btns = new InlineBuilder();
      service.buildList(btns, arr);
      expect(btns.getLines()).toMatchSnapshot();
    });
  });
});
