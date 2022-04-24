import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';

export async function getConfigFile(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const configFile = await wg.getWireguardConfig().catch((err) => {
      console.log('Error during file extraction');
    });
    if (configFile) {
      await ctx
        .replyWithDocument({ source: configFile.filePath, filename: configFile.fileName })
        .catch((err) => {
          console.log('Error during file sending');
        });
    }
  }
}
