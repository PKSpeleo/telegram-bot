import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';
import { stringifyDebugDate } from '../shared/debug';

export async function getUsersStats(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const stats = await wg.getUsersStats().catch((err) => {
      console.log('Error during stats collecting: ', err);
    });
    if (stats) {
      await ctx
        .reply(`There is Users statistics for '${botProperties.NAME}' server:
  - Total keys generated: ${stats.stats.totalUsers}
  - Total unique users: ${stats.stats.totalUniqueUsers}
  - Users with One keys: ${stats.stats.usersWithOneKey}
  - Users with Two keys: ${stats.stats.usersWithTwoKeys}
  - Users with Three keys: ${stats.stats.usersWithThreeKeys}
  - Users with More keys: ${stats.stats.usersWithFourAndMoreKeys}`, {
          reply_to_message_id: ctx.message.message_id
        })
        .catch(() => {
          logger.writeToLogFile('🛑 Error during replay. To big message.');
          ctx.reply(
            `🛑 Error during replay. To big message. Look like it is something too big =)`,
            {
              reply_to_message_id: ctx.message.message_id
            }
          );
        });
    }
  }
}
