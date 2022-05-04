import { BotContext } from '../shared/interfaces';

export function reactOnHelpCommand(ctx: BotContext) {
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isPrivateChat) {
    ctx.reply(
      `Send /start to receive a greeting
Send /help to help
Send /info to get some info
Send /quit to ask Bot to leave the chat`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }
}
