import { BotProperties } from './shared/interfaces';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import ping from 'ping';

export function startBot(botProperties: BotProperties) {
  const bot: Telegraf<Context<Update>> = new Telegraf(botProperties.TOKEN);

  bot.start((ctx) => {
    ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!`);
    if (botProperties.DEBUG) {
      const date = new Date(ctx.message.date * 1000);
      console.log('===> Start - Debug data: begin <===');
      console.log('Date and time: ', date.toLocaleString());
      console.log(`User '${ctx.from.first_name} ${ctx.from.last_name}' with ID '${ctx.from.id}'
wrote to the chat ID '${ctx.chat.id}'
massage: ${ctx.message.text}`);
      console.log('===> Start - Debug data: end <===');
    }
  });

  bot.help((ctx) => {
    ctx.reply('Send /start to receive a greeting');
    ctx.reply('Send /help to help');
    ctx.reply('Send /ping to ping');
    ctx.reply('Send /info to get some info');
    ctx.reply('Send /quit to ask Bot to leave the chat');
  });

  bot.command('ping', (ctx) => {
    const isAdmin = botProperties.ADMIN_ID && ctx.from.id === botProperties.ADMIN_ID;
    const isSupportedChat =
      botProperties.SUPPORTED_CHAT_ID && ctx.chat.id === botProperties.SUPPORTED_CHAT_ID;
    if (isAdmin || isSupportedChat) {
      ctx.reply('Start pinging NL server from RUS!\nTrying 10 times.\nWait 10 seconds, pls...');
      ping.promise
        .probe(botProperties.SERVER_FOR_PING, {
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

  bot.command('info', (ctx) => {
    const isAdmin = botProperties.ADMIN_ID && ctx.from.id === botProperties.ADMIN_ID;
    const isSupportedChat =
      botProperties.SUPPORTED_CHAT_ID && ctx.chat.id === botProperties.SUPPORTED_CHAT_ID;
    if (isAdmin || isSupportedChat) {
      ctx.reply(`You are '${ctx.from.first_name}' '${ctx.from.last_name}' ('@${ctx.from.username}')!
Your ID is: '${ctx.from.id}'
This chat ID is: '${ctx.chat.id}'
I am Bot version: '${botProperties.VERSION}'`);

      if (botProperties.DEBUG) {
        const date = new Date(ctx.message.date * 1000);
        console.log('===> Info - Debug data: begin <===');
        console.log('Date and time: ', date.toLocaleString());
        console.log(`User '${ctx.from.first_name} ${ctx.from.last_name}' with ID '${ctx.from.id}'
wrote to the chat ID '${ctx.chat.id}'
massage: ${ctx.message.text}`);
        console.log('===> Info - Debug data: end <===');
      }
    }
  });

  bot.command('quit', (ctx) => {
    // Explicit usage
    // ctx.telegram.leaveChat(ctx.message.chat.id);
    // Context shortcut
    const isAdmin = botProperties.ADMIN_ID && ctx.from.id === botProperties.ADMIN_ID;
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
}
