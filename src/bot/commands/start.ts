import { BotContext } from '../shared/interfaces';

export function reactOnStartCommand(ctx: BotContext) {
  ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!`);
}
