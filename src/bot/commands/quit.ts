import { BotContext, BotProperties } from '../shared/interfaces';
import { extractRights } from '../shared/rights';

export async function reactOnQuitCommand(ctx: BotContext, botProperties: BotProperties) {
  // Explicit usage
  // ctx.telegram.leaveChat(ctx.message.chat.id);
  // Context shortcut
  const { isAdmin } = await extractRights(ctx, botProperties);
  if (isAdmin) {
    ctx.reply('Goodbye ' + ctx.from.first_name + '!');
    ctx.leaveChat();
  }
}
