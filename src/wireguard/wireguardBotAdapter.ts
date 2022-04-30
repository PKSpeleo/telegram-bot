import { PromiseQueue } from '../utils/promiseQueue';
import {addClient, createBackup, GetConfigFile, getConfigFile} from './wireguard';
import { BotContext, BotProperties } from '../bot/shared/interfaces';
import { PeerDataConfig } from './wireguardConfigUtils';

//TODO set maximum keys limit when generating it

export class WireguardBotAdapter {
  private queue = new PromiseQueue();

  public async getBackup(): Promise<GetConfigFile> {
    return this.queue.enqueue(createBackup);
  }

  public async addClient(botProperties: BotProperties, ctx: BotContext): Promise<GetConfigFile> {
    const dataForPeerConfig: PeerDataConfig = {
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      userName: ctx.from.username,
      userId: ctx.from.id.toString()
    };

    function createAddClientFunction() {
      return addClient(dataForPeerConfig, botProperties.SERVER_IP, botProperties.NAME);
    }
    return this.queue.enqueue(createAddClientFunction);
  }
}
