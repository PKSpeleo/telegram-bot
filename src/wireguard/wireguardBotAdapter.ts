import { PromiseQueue } from '../utils/promiseQueue';
import {GetConfigFile, getConfigFile} from './wireguard';

export class WireguardBotAdapter {
  private queue = new PromiseQueue();

  public async getWireguardConfig(): Promise<GetConfigFile> {
    return this.queue.enqueue(getConfigFile);
  }
}
