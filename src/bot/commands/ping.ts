import { BotContext, BotProperties, ServerForPing } from '../shared/interfaces';
import ping from 'ping';
import { extractRights } from '../shared/rights';

export async function reactOnPingCommand(ctx: BotContext, botProperties: BotProperties) {
  const { isAdmin, isSupportedChat } = await extractRights(ctx, botProperties);
  if (isAdmin || isSupportedChat) {
    const serversForPing = botProperties.SERVER_FOR_PING;
    const serversNamesForPing = serversForPing.map((value) => value.NAME);

    ctx.reply(`Hi!
From '${botProperties.NAME}' I will ping ${
      serversForPing.length
    } servers: ${serversNamesForPing.join(', ')}.
Please wait ${10 * serversForPing.length} seconds.`);

    serversForPing.forEach((server) => {
      pingServer(server, ctx, botProperties.NAME);
    });
  }
}

function pingServer(server: ServerForPing, ctx: BotContext, botName: string) {
  ping.promise
    .probe(server.ADDRESS, {
      timeout: 1,
      extra: ['-c', '10']
    })
    .then((res) => {
      if (res.alive) {
        ctx.reply(`I just pinged '${server.NAME}' from '${botName}'.
The server works fine!
Response time: ${res.times.map((val) => Math.round(Number(val))).join(', ')} ms.
Lost packages: ${Math.round(Number(res.packetLoss))}% out of 10`);
      } else {
        ctx.reply(`The server NOT works!
Response time: ${res.times.map((val) => Math.round(Number(val))).join(', ')} ms.
Lost packages: ${Math.round(Number(res.packetLoss))}% out of 10'`);
      }
    })
    .catch((err) => {
      ctx.reply('Error: ', err);
    });
}
