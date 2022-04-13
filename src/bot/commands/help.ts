import { BotContext } from '../shared/interfaces';

export function reactOnHelpCommand(ctx: BotContext) {
  ctx.reply(`Send /start to receive a greeting
Send /help to help
Send /ping to ping
Send /info to get some info
Send /quit to ask Bot to leave the chat`, { reply_to_message_id: ctx.message.message_id});
}
