import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { determineIsUserMemberOfSupportedChats, extractRights } from '../shared/rights';
import { wg } from '../../app';

export async function deleteLeftUsers(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
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
          `Users to be deleted: ${telegramUsersFromChat}`,
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
