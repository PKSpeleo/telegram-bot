import { BotContext, BotProperties } from '../shared/interfaces';
import { extractRights } from '../shared/rights';

export async function reactOnInfoCommand(ctx: BotContext, botProperties: BotProperties) {
  const { isAdmin, isSupportedChat, isUserMemberOfSupportedChats } = await extractRights(
    ctx,
    botProperties
  );
  if (isAdmin || isSupportedChat) {
    ctx.reply(`You are '${ctx.from.first_name}' '${ctx.from.last_name}' ('@${
      ctx.from.username
    }')! ${isUserMemberOfSupportedChats ? '+' : '-'}
Your ID is: '${ctx.from.id}' ${isAdmin ? '+' : '-'}
This chat ID is: '${ctx.chat.id}' ${isSupportedChat ? '+' : '-'}
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
