import { BotContext, BotProperties } from '../shared/interfaces';
import ping from 'ping';

export function reactOnPingCommand(ctx: BotContext, botProperties: BotProperties) {
  const isAdmin = botProperties.ADMIN_ID && ctx.from.id === botProperties.ADMIN_ID;
  const isSupportedChat =
    botProperties.SUPPORTED_CHAT_ID && ctx.chat.id === botProperties.SUPPORTED_CHAT_ID;
  if (isAdmin || isSupportedChat) {
    ctx.reply('Start pinging NL server from RUS!\nTrying 10 times.\nWait 10 seconds, pls...');
    ping.promise
      .probe(botProperties.SERVER_FOR_PING, {
        timeout: 1,
        extra: ['-c', '10']
      })
      .then((res) => {
        if (res.alive) {
          ctx.reply(`The server works fine!
Response time: ${res.times.map((val) => Math.round(Number(val))).join(', ')} ms.
Lost packages: ${Math.round(Number(res.packetLoss))}% out of 10`);
        } else {
          ctx.reply(`The server NOT works!
Response time: ${res.times.map((val) => Math.round(Number(val))).join(', ')} ms.
Lost packages: ${Math.round(Number(res.packetLoss))}% out of 10'`);
        }
      })
      .finally(() => {
        ctx.reply('I am Done!');
      })
      .catch((err) => {
        ctx.reply('Error: ', err);
      });
  }
}
