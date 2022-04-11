import { BotContext, BotProperties } from '../shared/interfaces';
import { sendMessagesToBosses } from '../shared/boss';

export async function reactOnStartCommand(ctx: BotContext, botProperties: BotProperties) {
  const messageForBosses = `👀 ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username}) ${ctx.from.id} started chat with Me`;
  await sendMessagesToBosses(botProperties.ADMIN_ID, ctx, messageForBosses);
  ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!`);
}
