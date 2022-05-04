import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';
import { stringifyDebugDate } from '../shared/debug';

export async function getBackup(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const configFile = await wg.getBackup(botProperties.NAME).catch((err) => {
      console.log('Error backup creation: ', err);
    });
    if (configFile) {
      await ctx
        .replyWithDocument({ source: configFile.filePath, filename: configFile.fileName })
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
