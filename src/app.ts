import * as console from 'console';
import dotenv from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import ping from 'ping';

dotenv.config();

const token = process.env.BOT_TOKEN;
const server = process.env.BOT_SERVER_FOR_PING;
const debug = process.env.BOT_DEBUG;
const adminId = process.env.BOT_ADMIN_ID;
const supportedChatId = process.env.BOT_SUPPORTED_CHAT_ID;

console.log('BOT Token', token);
console.log('Server for ping: ', server);
if (debug) {
  console.log('Debug mode enabled! Start command will be logged to the console.');
}

if (token === undefined) {
  throw new Error('Telegram Bot token is missing!');
}

if (server === undefined) {
  throw new Error('Server for ping is missing!!');
}

const bot: Telegraf<Context<Update>> = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!
Your ID is: '${ctx.from.id}'`);
  if (debug) {
    const date = new Date(ctx.message.date * 1000);
    console.log('===> Debug data: begin <===');
    console.log('Date and time: ', date.toLocaleString());
    console.log(`User '${ctx.from.first_name} ${ctx.from.last_name}' with ID '${ctx.from.id}'
wrote to the chat ID '${ctx.chat.id}'
massage: ${ctx.message.text}`);
    console.log('===> Debug data: end <===');
  }
});

bot.help((ctx) => {
  ctx.reply('Send /start to receive a greeting');
  ctx.reply('Send /help to help');
  ctx.reply('Send /ping to ping');
  ctx.reply('Send /quit to ask Bot to leave the chat');
});

bot.command('ping', (ctx) => {
  const isAdmin = adminId && ctx.from.id.toString() === adminId;
  const isSupportedChat = supportedChatId && ctx.chat.id.toString() === supportedChatId;
  if (isAdmin || isSupportedChat) {
    ctx.reply('Start pinging NL server from RUS!\nTrying 10 times.\nWait 10 seconds, pls...');
    ping.promise
      .probe(server, {
        timeout: 1,
        extra: ['-c', '10']
      })
      .then((res) => {
        if (res.alive) {
          ctx.reply(`The server works fine!
Response time: ${res.times.map((val) => Math.round(Number(val))).join(', ')} ms.
Lost packages: ${Math.round(Number(res.packetLoss))}% out of 10`);
        } else {
          ctx.reply(`The server NOT works!
Response time: ${res.times.map((val) => Math.round(Number(val))).join(', ')} ms.
Lost packages: ${Math.round(Number(res.packetLoss))}% out of 10'`);
        }
      })
      .finally(() => {
        ctx.reply('I am Done!');
      })
      .catch((err) => {
        ctx.reply('Error: ', err);
      });
  }
});

bot.command('quit', (ctx) => {
  // Explicit usage
  // ctx.telegram.leaveChat(ctx.message.chat.id);
  // Context shortcut
  const isAdmin = adminId && ctx.from.id.toString() === adminId;
  if (isAdmin) {
    ctx.reply('Goodbye ' + ctx.from.first_name + '!');
    ctx.leaveChat();
  }
});

bot
  .launch()
  .then(() => {
    console.log('Bot started successfully!');
  })
  .catch((err) => {
    console.error('Wow! Bot crashed during start: ', err);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
