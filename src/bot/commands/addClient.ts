import { BotContext, BotProperties } from '../shared/interfaces';
import { Logger } from '../../utils/logger';
import { extractRights } from '../shared/rights';
import { wg } from '../../app';
import { stringifyDebugDate } from '../shared/debug';
import { sendMessagesToBosses } from '../shared/boss';

const MAXIMUM_NUMBER_OF_KEYS = 3;

export async function addClient(ctx: BotContext, botProperties: BotProperties, logger: Logger) {
  const { isAdmin, isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
  const isPrivateChat = ctx.from.id == ctx.chat.id;

  const messageForBosses = `🔑 ${ctx.from.first_name} ${ctx.from.last_name} (@${
    ctx.from.username
  }) ${ctx.from.id} ${isUserMemberOfSupportedChats ? '+' : '-'} Creating the key`;
  await sendMessagesToBosses(botProperties.ADMIN_ID, ctx, messageForBosses);
  ctx.reply(`Hello, ${ctx.from.first_name} ${ctx.from.last_name} (@${ctx.from.username})!`, {
    reply_to_message_id: ctx.message.message_id
  });

  if (isPrivateChat && (isAdmin || isUserMemberOfSupportedChats)) {
    const configFile = await wg
      .addClient(botProperties, ctx, isAdmin ? undefined : MAXIMUM_NUMBER_OF_KEYS)
      .catch(async (err) => {
        ctx.reply('Sorry, bot something went wrong. Ask admin for support.', {
          reply_to_message_id: ctx.message.message_id
        });
        console.log('Error during client adding! ', err);
        logger.writeToLogFile(
          '🛑 ' +
            (await stringifyDebugDate(ctx, botProperties)) +
            ` Error during client adding: ${err}`
        );
      });
    if (configFile && !configFile.additionalData?.isKeysNumberLimitExceeded) {
      await ctx
        .replyWithDocument({ source: configFile.filePath, filename: configFile.fileName })
        .catch(async (err) => {
          console.log('Error during file sending', err);
          logger.writeToLogFile(
            '🛑 ' +
              (await stringifyDebugDate(ctx, botProperties)) +
              ` Error during client adding: ${err}`
          );
        });
      logger.writeToLogFile(
        '🔑 ' +
          (await stringifyDebugDate(ctx, botProperties)) +
          ` New client key number ${configFile.additionalData?.currentKeyNumber} added!`
      );
    } else {
      ctx.reply(`Sorry, but you already have ${MAXIMUM_NUMBER_OF_KEYS} keys. No more allowed.`, {
        reply_to_message_id: ctx.message.message_id
      });
      logger.writeToLogFile(
        '🔑 🚫' +
          (await stringifyDebugDate(ctx, botProperties)) +
          ` Reached keys number limit: ${MAXIMUM_NUMBER_OF_KEYS}`
      );
    }
  }
}
