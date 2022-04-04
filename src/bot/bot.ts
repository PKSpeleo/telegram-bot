import { BotProperties } from './shared/interfaces';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { reactOnStartCommand } from './commands/start';
import { reactOnHelpCommand } from './commands/help';
import { reactOnPingCommand } from './commands/ping';
import { reactOnInfoCommand } from './commands/info';
import { reactOnQuitCommand } from './commands/quit';

export async function startBot(botProperties: BotProperties) {
  const bot: Telegraf<Context<Update>> = new Telegraf(botProperties.TOKEN);

  bot.start((ctx) => {
    reactOnStartCommand(ctx, botProperties);
  });

  bot.help((ctx) => {
    reactOnHelpCommand(ctx);
  });

  bot.command('ping', (ctx) => {
    reactOnPingCommand(ctx, botProperties);
  });

  bot.command('info', (ctx) => {
    reactOnInfoCommand(ctx, botProperties);
  });

  bot.command('quit', (ctx) => {
    reactOnQuitCommand(ctx, botProperties);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot.launch();
}
