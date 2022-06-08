import { BotContext, BotProperties, USER_STATUSES, UserStatusForChat } from './interfaces';

const MEMBER_STATUSES = [USER_STATUSES.CREATOR, USER_STATUSES.ADMINISTRATOR, USER_STATUSES.MEMBER];

export async function extractRights(ctx: BotContext, botProperties: BotProperties) {
  const isAdmin = Boolean(
    botProperties.ADMIN_ID?.length && botProperties.ADMIN_ID.includes(ctx.from.id)
  );
  const isSupportedChat = Boolean(
    botProperties.SUPPORTED_CHAT_ID?.length && botProperties.SUPPORTED_CHAT_ID.includes(ctx.chat.id)
  );

  const isUserMemberOfSupportedChats = await determineIsUserMemberOfSupportedChats(
    ctx,
    botProperties,
    ctx.from.id
  );

  return { isAdmin, isSupportedChat, isUserMemberOfSupportedChats };
}

export async function determineIsUserMemberOfSupportedChats(
  ctx: BotContext,
  botProperties: BotProperties,
  userId: number
): Promise<boolean> {
  const userStatusesForSupportedChats = await getUserStatusesForSupportedChats(
    botProperties.SUPPORTED_CHAT_ID,
    userId,
    ctx
  );

  const userStatuses: string[] = userStatusesForSupportedChats.map((value) => value.userStatus);

  const isUserMemberOfSupportedChats = userStatuses.some((status) =>
    MEMBER_STATUSES.includes(status)
  );

  return isUserMemberOfSupportedChats;
}

async function getUserStatusesForSupportedChats(
  chatIds: number[],
  userId: number,
  ctx: BotContext
) {
  const statuses: UserStatusForChat[] = [];
  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const chatMember = await ctx.telegram.getChatMember(chatId, userId);
        statuses.push({
          chatId: chatId,
          userStatus: chatMember.status
        });
      } catch (error) {
        statuses.push({
          chatId: chatId,
          userStatus: 'unknown'
        });
      }
    })
  );
  return statuses;
}
