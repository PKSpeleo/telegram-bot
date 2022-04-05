import { BotContext, BotProperties } from '../shared/interfaces';

export function reactOnInfoCommand(ctx: BotContext, botProperties: BotProperties) {
  const isAdmin = botProperties.ADMIN_ID && ctx.from.id === botProperties.ADMIN_ID;
  const isSupportedChat =
    botProperties.SUPPORTED_CHAT_ID && ctx.chat.id === botProperties.SUPPORTED_CHAT_ID;
  if (isAdmin || isSupportedChat) {
    ctx.reply(`You are '${ctx.from.first_name}' '${ctx.from.last_name}' ('@${ctx.from.username}')!
Your ID is: '${ctx.from.id}'
This chat ID is: '${ctx.chat.id}'
I am '${botProperties.NAME}' Bot version: '${botProperties.VERSION}'`);

    if (botProperties.DEBUG) {
      const date = new Date(ctx.message.date * 1000);
      console.log('===> Info - Debug data: begin <===');
      console.log('Date and time: ', date.toLocaleString());
      console.log(`User '${ctx.from.first_name} ${ctx.from.last_name}' with ID '${ctx.from.id}'
wrote to the chat ID '${ctx.chat.id}'
massage: ${ctx.message.text}`);
      console.log('===> Info - Debug data: end <===');
    }
  }
}
