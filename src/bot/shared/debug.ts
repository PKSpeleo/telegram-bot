import { BotContext, BotProperties } from './interfaces';
import chalk from 'chalk';

export function logDebugInfoToConsole(
  ctx: BotContext,
  botProperties: BotProperties,
  commandName?: string
) {
  if (botProperties.DEBUG) {
    const date = new Date(ctx.message.date * 1000);
    console.log(
      chalk.yellow(
        `🐞 ⬇ ⬇ ⬇ Debug info for '${chalk.green(commandName || ctx.message.text)}' ⬇ ⬇ ⬇ 🐞`
      )
    );
    console.log('Date and time: ', date.toLocaleString());
    console.log(`User '${ctx.from.first_name} ${ctx.from.last_name}' with ID '${ctx.from.id}'
wrote to the chat ID '${ctx.chat.id}'
massage: ${ctx.message.text}`);
    console.log(
      chalk.yellow(
        `🐞 ⬆ ⬆ ⬆ Debug info for '${chalk.green(commandName || ctx.message.text)}' ⬆ ⬆ ⬆ 🐞`
      )
    );
  }
}

export function stringifyDebugDate(ctx: BotContext): string {
  return `User: '${ctx.from.first_name}' '${ctx.from.last_name}' '${ctx.from.username}' with ID: '${ctx.from.id}', chat ID: '${ctx.chat.id}', command: '${ctx.message.text}'`;
}
