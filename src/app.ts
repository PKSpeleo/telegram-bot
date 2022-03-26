import * as console from 'console';
import dotenv from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';

dotenv.config();

console.log(process.env.BOT_TOKEN);
console.log(process.env.BOT_URL);

const token = process.env.BOT_TOKEN;

if (token === undefined) {
  throw new Error('Telegram Bot token is missing!');
}

const bot: Telegraf<Context<Update>> = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply('Hello ' + ctx.from.first_name + '!');
});

bot.help((ctx) => {
  ctx.reply('Send /start to receive a greeting');
  ctx.reply('Send /ping to help');
  ctx.reply('Send /ping to ping');
  ctx.reply('Send /quit to stop the bot');
});

bot.command('ping', (ctx) => {
  ctx.reply('Ping!');
});

bot.command('quit', (ctx) => {
  // Explicit usage
  // ctx.telegram.leaveChat(ctx.message.chat.id);
  // Context shortcut
  ctx.reply('Goodbye ' + ctx.from.first_name + '!');
  ctx.leaveChat();
});

bot
  .launch()
  .then(() => {
    console.log('Bot started successfully!');
  })
  .catch((err) => {
    console.error('Wow! Bot crashed during start!: ', err);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
