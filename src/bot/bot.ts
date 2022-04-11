import { BotProperties } from './shared/interfaces';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { reactOnStartCommand } from './commands/start';
import { reactOnHelpCommand } from './commands/help';
import { reactOnPingCommand } from './commands/ping';
import { reactOnInfoCommand } from './commands/info';
import { reactOnQuitCommand } from './commands/quit';
import { logDebugInfoToConsole } from './shared/debug';

export async function startBot(botProperties: BotProperties) {
  const bot: Telegraf<Context<Update>> = new Telegraf(botProperties.TOKEN);

  try {
    await bot.telegram.sendMessage(
      botProperties.ADMIN_ID[0],
      `🤖 I'm Back! '${botProperties.VERSION}'`
    );
  } catch (err) {
    console.log('Error: ', err);
  }

  bot.start((ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    reactOnStartCommand(ctx);
  });

  bot.help((ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    reactOnHelpCommand(ctx);
  });

  bot.command('ping', (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    reactOnPingCommand(ctx, botProperties);
  });

  bot.command('info', (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    reactOnInfoCommand(ctx, botProperties);
  });

  bot.command('quit', (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    reactOnQuitCommand(ctx, botProperties);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot.launch();
}
