import { BotProperties } from './shared/interfaces';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { reactOnStartCommand } from './commands/start';
import { reactOnHelpCommand } from './commands/help';
import { reactOnPingCommand } from './commands/ping';
import { reactOnInfoCommand } from './commands/info';
import { reactOnQuitCommand } from './commands/quit';
import { logDebugInfoToConsole, stringifyDebugDate } from './shared/debug';
import { sendMessagesToBosses } from './shared/boss';
import { Logger } from '../utils/logger';

export async function startBot(botProperties: BotProperties, logger: Logger) {
  const bot: Telegraf<Context<Update>> = new Telegraf(botProperties.TOKEN);

  await sendMessagesToBosses(
    botProperties.ADMIN_ID,
    bot,
    `🤖 I'm Back! '${botProperties.VERSION}'`
  );

  bot.start((ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(stringifyDebugDate(ctx));
    reactOnStartCommand(ctx, botProperties);
  });

  bot.help((ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(stringifyDebugDate(ctx));
    reactOnHelpCommand(ctx);
  });

  bot.command('ping', (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(stringifyDebugDate(ctx));
    reactOnPingCommand(ctx, botProperties);
  });

  bot.command('info', (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(stringifyDebugDate(ctx));
    reactOnInfoCommand(ctx, botProperties);
  });

  bot.command('quit', (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(stringifyDebugDate(ctx));
    reactOnQuitCommand(ctx, botProperties);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot.launch();
}
