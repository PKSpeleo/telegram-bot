import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';
import { stringifyDebugDate } from '../shared/debug';

const MAXIMUM_NUMBER_OF_KEYS = 3;

export async function addClient(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const configFile = await wg
      .addClient(botProperties, ctx, isAdmin ? undefined : MAXIMUM_NUMBER_OF_KEYS)
      .catch(async (err) => {
        ctx.reply('Sorry, bot something went wrong. Ask admin for support.', {
          reply_to_message_id: ctx.message.message_id
        });
        console.log('Error during client adding! ', err);
        logger.writeToLogFile('🛑 ' + (await stringifyDebugDate(ctx, botProperties)) + ' Error!');
      });
    if (configFile && !configFile.additionalData?.isKeysNumberLimitExceeded) {
      await ctx
        .replyWithDocument({ source: configFile.filePath, filename: configFile.fileName })
        .catch((err) => {
          console.log('Error during file sending');
        });
      logger.writeToLogFile(
        '🔑 ' +
          (await stringifyDebugDate(ctx, botProperties)) +
          ` New client key number ${configFile.additionalData?.currentKeyNumber} added!`
      );
    } else {
      ctx.reply(`Sorry, but you already have ${MAXIMUM_NUMBER_OF_KEYS} keys. No more allowed.`, {
        reply_to_message_id: ctx.message.message_id
      });
      logger.writeToLogFile(
        '🔑 🚫' +
          (await stringifyDebugDate(ctx, botProperties)) +
          ` Reached keys number limit: ${MAXIMUM_NUMBER_OF_KEYS}`
      );
    }
  }
}
