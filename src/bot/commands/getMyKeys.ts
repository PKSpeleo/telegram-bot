import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';

export async function getMyKeys(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;
  if (isUserMemberOfSupportedChats && isPrivateChat) {
    const keysPaths = await wg.getUsersKeysPaths(ctx.from.id).catch((err) => {
      console.log('Error during keys extraction: ', err);
    });
    if (keysPaths && keysPaths.length) {
      await ctx.reply('Here it is you previously generated keys:', {
        reply_to_message_id: ctx.message.message_id
      });
      for (const path of keysPaths) {
        await ctx.replyWithDocument({ source: path }).catch((err) => {
          console.log('Error during file sending');
        });
      }
    } else {
      ctx.reply('You dont have any generated keys. Please generate it!', {
        reply_to_message_id: ctx.message.message_id
      });

    }
  }
}
