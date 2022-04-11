import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';

export async function sendMessagesToBosses(
  bosses: number[],
  bot: Telegraf<Context<Update>>,
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
