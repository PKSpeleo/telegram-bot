import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { determineIsUserMemberOfSupportedChats, extractRights } from '../shared/rights';
import { wg } from '../../app';

export async function getUsersStats(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const stats = await wg.getUsersStats().catch((err) => {
      console.log('Error during stats collecting: ', err);
    });
    if (stats) {
      const telegramUsers = stats.telegramUsersIds;
      const telegramUsersNotInChat: string[] = [];
      const telegramUsersFromChat: string[] = [];
      for (const userId of telegramUsers) {
        const isUserInChat = await determineIsUserMemberOfSupportedChats(
          ctx,
          botProperties,
          Number(userId)
        ).catch((err) => {
          console.log('Error during user checking: ', err);
        });

        if (isUserInChat) {
          telegramUsersFromChat.push(userId);
        } else {
          telegramUsersNotInChat.push(userId);
        }
      }

      await ctx
        .reply(
          `There is Users statistics for '${botProperties.NAME}' server:
  - Total keys generated: ${stats.stats.totalUsers}
  - Total unique users: ${stats.stats.totalUniqueUsers}

  - Total telegram users: ${stats.stats.totalTelegramUsers}
  - Total telegram users in the chat: ${telegramUsersFromChat.length}
  - Total telegram users NOT in the chat: ${telegramUsersNotInChat.length}

  - Users with One keys: ${stats.stats.usersWithOneKey}
  - Users with Two keys: ${stats.stats.usersWithTwoKeys}
  - Users with Three keys: ${stats.stats.usersWithThreeKeys}
  - Users with More keys: ${stats.stats.usersWithFourAndMoreKeys}`,
          {
            reply_to_message_id: ctx.message.message_id
          }
        )
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
