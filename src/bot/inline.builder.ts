import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
} from 'node-telegram-bot-api';

export class InlineBuilder {
  protected lines: InlineKeyboardButton[][] = [[]];

  constructor();
  constructor(params: InlineKeyboardButton);
  constructor(params: InlineKeyboardButton[]);
  constructor(
    params: InlineKeyboardButton | InlineKeyboardButton[] = undefined,
  ) {
    if (typeof params === 'undefined') {
      return;
    }
    if (!Array.isArray(params)) {
      params = [params];
    }
    params.forEach((p) => this.addButton(p));
  }

  addButton(params: InlineKeyboardButton): this {
    this.lines[this.lines.length - 1].push(params);
    return this;
  }

  nextLine() {
    this.lines.push([]);
    return this;
  }

  mergeLines(lines: []) {
    this.lines.push(lines);
  }

  getLines(): InlineKeyboardButton[][] {
    return this.lines;
  }

  getReply(): TelegramBot.SendMessageOptions {
    return <TelegramBot.SendMessageOptions>{
      reply_markup: this.getReplyEdit(),
    };
  }

  getReplyEdit(): InlineKeyboardMarkup {
    return <InlineKeyboardMarkup>{
      inline_keyboard: this.lines,
    };
  }
}
