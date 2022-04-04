import { BotContext, BotProperties } from '../shared/interfaces';

export function reactOnQuitCommand(ctx: BotContext, botProperties: BotProperties) {
  // Explicit usage
  // ctx.telegram.leaveChat(ctx.message.chat.id);
  // Context shortcut
  const isAdmin = botProperties.ADMIN_ID && ctx.from.id === botProperties.ADMIN_ID;
  if (isAdmin) {
    ctx.reply('Goodbye ' + ctx.from.first_name + '!');
    ctx.leaveChat();
  }
}
