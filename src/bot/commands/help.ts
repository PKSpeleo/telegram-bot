import { BotContext, BotProperties } from '../shared/interfaces';
import { extractRights } from '../shared/rights';

export async function reactOnHelpCommand(ctx: BotContext, botProperties: BotProperties) {
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  const { isAdmin } = await extractRights(ctx, botProperties);
  if (isAdmin) {
    ctx.reply(
      `Send /start to receive a greeting
Send /help to help
Send /info to get some info
Send /log to get Log
Send /addclient to add Client
Send /getmykeys to get My keys
Send /getbackup to get Backup
Send /getkeyuserpairs to get Statistic
Send /getusersstats to get Statistic
`,
      { reply_to_message_id: ctx.message.message_id }
    );
  } else if (isPrivateChat) {
    ctx.reply(
      `Send /start to receive a greeting
Send /help to help
Send /info to get some info
`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }
}
