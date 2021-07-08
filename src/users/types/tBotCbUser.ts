import { TBotCb } from '../../bot/types/tBotCb';
import { TPagination } from '../../bot/types/tPagination';

export type TBotCbUser = {
  u: 'pag' | 'cmd'; // p = pagination, cmd - command
  d?: string; // d = data
} & TBotCb &
  TPagination;
