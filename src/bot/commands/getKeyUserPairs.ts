import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';
import { stringifyDebugDate } from '../shared/debug';

export async function getKeyUserPairs(
  ctx: BotContext,
  botProperties: BotProperties,
  logger: Logger
) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const pairsFile = await wg.getKeyUserPairsFile().catch((err) => {
      console.log('Error key user pairs creation: ', err);
    });
    if (pairsFile) {
      await ctx
        .replyWithDocument({ source: pairsFile.filePath, filename: pairsFile.fileName })
        .catch(async (err) => {
          console.log('Error during file sending: ', err);
          logger.writeToLogFile(
            '🛑 ' +
              (await stringifyDebugDate(ctx, botProperties)) +
              ` Error during file sending: ${err}`
          );
        });
    }
  }
}
