import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';

export async function reactOnLogCommand(
  ctx: BotContext,
  botProperties: BotProperties,
  logger: Logger
) {
  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const lastLogLines = await logger.getLastLogStrings();
    ctx.reply(
      `Total strings in the Log: ${lastLogLines.totalStringsAmount}
last ${lastLogLines.requestedStringsAmount} strings of Log: \n${lastLogLines.logStrings.join(
        '\n'
      )}`,
      {
        reply_to_message_id: ctx.message.message_id
      }
    );
  }
}
