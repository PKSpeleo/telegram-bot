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
import { reactOnLogCommand } from './commands/log';
import { getConfigFile } from './commands/getConfigFile';

export async function startBot(botProperties: BotProperties, logger: Logger) {
  const bot: Telegraf<Context<Update>> = new Telegraf(botProperties.TOKEN);

  await sendMessagesToBosses(
    botProperties.ADMIN_ID,
    bot,
    `🤖 I'm Back! '${botProperties.VERSION}'`
  );

  bot.start(async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    reactOnStartCommand(ctx, botProperties);
  });

  bot.help(async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    reactOnHelpCommand(ctx);
  });

  bot.command('ping', async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    reactOnPingCommand(ctx, botProperties);
  });

  bot.command('info', async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    reactOnInfoCommand(ctx, botProperties);
  });

  bot.command('log', async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    reactOnLogCommand(ctx, botProperties, logger);
  });

  bot.command('getConfigFile', async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    getConfigFile(ctx, botProperties, logger);
  });

  bot.command('quit', async (ctx) => {
    logDebugInfoToConsole(ctx, botProperties);
    logger.writeToLogFile(await stringifyDebugDate(ctx, botProperties));
    reactOnQuitCommand(ctx, botProperties);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot.launch();
}
