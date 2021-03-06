import { BotContext, BotProperties } from '../shared/interfaces';
import { extractRights } from '../shared/rights';

export async function reactOnInfoCommand(ctx: BotContext, botProperties: BotProperties) {
  const { isAdmin, isSupportedChat, isUserMemberOfSupportedChats } = await extractRights(
    ctx,
    botProperties
  );
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if ((isPrivateChat && isUserMemberOfSupportedChats) || isAdmin) {
    ctx.reply(
      `You are '${ctx.from.first_name}' '${ctx.from.last_name}' ('@${ctx.from.username}')! ${
        isUserMemberOfSupportedChats ? '+' : '-'
      }
Your ID is: '${ctx.from.id}' ${isAdmin ? '+' : '-'}
This chat ID is: '${ctx.chat.id}' ${isSupportedChat ? '+' : '-'}
I am '${botProperties.NAME}' Bot version: '${botProperties.VERSION}'`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }
}
