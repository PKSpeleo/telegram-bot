import { Context } from 'telegraf';
import { Message, Update } from 'typegram';

export interface BotProperties {
  TOKEN: string;
  SERVER_FOR_PING: string;
  ADMIN_ID?: number;
  SUPPORTED_CHAT_ID?: number;
  DEBUG?: boolean;
  VERSION?: string;
  URL?: string;
  NAME?: string;
}

export interface BotContext
  extends Context<{
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }>,
    Omit<Context<Update>, keyof Context<Update>> {}
