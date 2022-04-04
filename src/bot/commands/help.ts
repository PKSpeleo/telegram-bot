import { BotContext } from '../shared/interfaces';

export function reactOnHelpCommand(ctx: BotContext) {
  ctx.reply('Send /start to receive a greeting');
  ctx.reply('Send /help to help');
  ctx.reply('Send /ping to ping');
  ctx.reply('Send /info to get some info');
  ctx.reply('Send /quit to ask Bot to leave the chat');
}
