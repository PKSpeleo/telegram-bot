import { BotContext, BotProperties } from './interfaces';
import chalk from 'chalk';
import { extractRights } from './rights';

export async function logDebugInfoToConsole(
  ctx: BotContext,
  botProperties: BotProperties,
  commandName?: string
) {
  if (botProperties.DEBUG) {
    const { isAdmin, isSupportedChat, isUserMemberOfSupportedChats } = await extractRights(
      ctx,
      botProperties
    );
    const date = new Date(ctx.message.date * 1000);
    console.log(
      chalk.yellow(
        `🐞 ⬇ ⬇ ⬇ Debug info for '${chalk.green(commandName || ctx.message.text)}' ⬇ ⬇ ⬇ 🐞`
      )
    );
    console.log('Date and time: ', date.toLocaleString());
    console.log(`User ${isUserMemberOfSupportedChats ? '+' : '-'} '${ctx.from.first_name} ${
      ctx.from.last_name
    }' with ID '${ctx.from.id}' ${isAdmin ? '+' : '-'}
wrote to the chat ID '${ctx.chat.id}' ${isSupportedChat ? '+' : '-'}
massage: ${ctx.message.text}`);
    console.log(
      chalk.yellow(
        `🐞 ⬆ ⬆ ⬆ Debug info for '${chalk.green(commandName || ctx.message.text)}' ⬆ ⬆ ⬆ 🐞`
      )
    );
  }
}

export async function stringifyDebugDate(
  ctx: BotContext,
  botProperties: BotProperties
): Promise<string> {
  const { isAdmin, isSupportedChat, isUserMemberOfSupportedChats } = await extractRights(
    ctx,
    botProperties
  );
  return `User ${isUserMemberOfSupportedChats ? '+' : '-'} : '${ctx.from.first_name}' '${
    ctx.from.last_name
  }' '${ctx.from.username}' with ID: '${ctx.from.id}' ${isAdmin ? '+' : '-'}, chat ID: '${
    ctx.chat.id
  }' ${isSupportedChat ? '+' : '-'}, command: '${ctx.message.text}'`;
}
