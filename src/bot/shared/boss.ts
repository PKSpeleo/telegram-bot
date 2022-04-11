import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { BotContext } from './interfaces';

export async function sendMessagesToBosses(
  bosses: number[],
  bot: Telegraf<Context<Update>> | BotContext,
  message: string
) {
  for (const boss of bosses) {
    try {
      await bot.telegram.sendMessage(boss, message);
    } catch (err) {
      console.log('Failed to send message to Boss: ', err);
    }
  }
  return;
}
