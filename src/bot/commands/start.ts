import { BotContext, BotProperties } from '../shared/interfaces';
import { sendMessagesToBosses } from '../shared/boss';
import { extractRights } from '../shared/rights';

export async function reactOnStartCommand(ctx: BotContext, botProperties: BotProperties) {
  const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
  const messageForBosses = `👀 ${ctx.from.first_name} ${ctx.from.last_name} (@${
    ctx.from.username
  }) ${ctx.from.id} ${isUserMemberOfSupportedChats ? '+' : '-'} started chat with Me`;
  await sendMessagesToBosses(botProperties.ADMIN_ID, ctx, messageForBosses);
  ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!`, { reply_to_message_id: ctx.message.message_id});
}
