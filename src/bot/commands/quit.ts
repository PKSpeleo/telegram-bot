import { BotContext, BotProperties } from '../shared/interfaces';
import { extractRights } from '../shared/rights';

export async function reactOnQuitCommand(ctx: BotContext, botProperties: BotProperties) {
  // Explicit usage
  // ctx.telegram.leaveChat(ctx.message.chat.id);
  // Context shortcut
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isNotPrivateChat = ctx.from.id !== ctx.chat.id;
  if (isAdmin && isNotPrivateChat) {
    ctx.reply('Goodbye ' + ctx.from.first_name + '!', {
      reply_to_message_id: ctx.message.message_id
    });
    ctx.leaveChat();
  }
}
