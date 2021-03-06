import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';

export async function reactOnLogCommand(
  ctx: BotContext,
  botProperties: BotProperties,
  logger: Logger
) {
  const messageParts = ctx.message.text.split(' ');
  let stringsAmount = 10;
  if (messageParts.length == 2) {
    const amountString: string = messageParts[1];
    const isNum = /^\d+$/.test(amountString);
    const amountNumber = isNum ? Number(amountString) : NaN;
    stringsAmount = Number.isInteger(amountNumber) ? amountNumber : stringsAmount;
  }

  const { isAdmin } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isAdmin && isPrivateChat) {
    const lastLogLines = await logger.getLastLogStrings(stringsAmount);
    ctx
      .reply(
        `Total strings in the Log: ${lastLogLines.totalStringsAmount}
last ${lastLogLines.requestedStringsAmount} strings of Log: \n${lastLogLines.logStrings.join(
          '\n'
        )}`,
        {
          reply_to_message_id: ctx.message.message_id
        }
      )
      .catch(() => {
        logger.writeToLogFile('🛑 Error during replay. To big message.');
        ctx.reply(`🛑 Error during replay. To big message. Look like it is too big Log =)`, {
          reply_to_message_id: ctx.message.message_id
        });
      });
  }
}
