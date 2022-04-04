import { BotContext, BotProperties } from '../shared/interfaces';

export function reactOnStartCommand(ctx: BotContext, botProperties: BotProperties) {
  ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!`);
  if (botProperties.DEBUG) {
    const date = new Date(ctx.message.date * 1000);
    console.log('===> Start - Debug data: begin <===');
    console.log('Date and time: ', date.toLocaleString());
    console.log(`User '${ctx.from.first_name} ${ctx.from.last_name}' with ID '${ctx.from.id}'
wrote to the chat ID '${ctx.chat.id}'
massage: ${ctx.message.text}`);
    console.log('===> Start - Debug data: end <===');
  }
}
