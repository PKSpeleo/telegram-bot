import { Context } from 'telegraf';
import { Message, Update } from 'typegram';

export const USER_STATUSES = {
  CREATOR: 'creator',
  ADMINISTRATOR: 'administrator',
  MEMBER: 'member',
  RESTRICTED: 'restricted',
  LEFT: 'left',
  BANNED: 'kicked',
  UNKNOWN: 'unknown'
};

export interface BotProperties {
  TOKEN: string;
  SERVER_FOR_PING: ServerForPing[];
  ADMIN_ID: number[];
  SUPPORTED_CHAT_ID: number[];
  DEBUG?: boolean;
  VERSION?: string;
  URL?: string;
  NAME: string;
}

export interface ServerForPing {
  NAME: string;
  ADDRESS: string;
}

export interface UserStatusForChat {
  chatId: number;
  userStatus: string;
}

export interface BotContext
  extends Context<{
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }>,
    Omit<Context<Update>, keyof Context<Update>> {}
