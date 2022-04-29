import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';
import { stringifyDebugDate } from '../shared/debug';

export async function addClient(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const configFile = await wg.addClient(botProperties, ctx).catch(async (err) => {
      ctx.reply('Sorry, bot something went wrong. Ask admin for support.', {
        reply_to_message_id: ctx.message.message_id
      });
      console.log('Error during client adding! ', err);
      logger.writeToLogFile('🛑 ' + (await stringifyDebugDate(ctx, botProperties)) + ' Error!');
    });
    if (configFile) {
      await ctx
        .replyWithDocument({ source: configFile.filePath, filename: configFile.fileName })
        .catch((err) => {
          console.log('Error during file sending');
        });
      logger.writeToLogFile(
        '🔑 ' + (await stringifyDebugDate(ctx, botProperties)) + ' New client added!'
      );
    }
  }
}
