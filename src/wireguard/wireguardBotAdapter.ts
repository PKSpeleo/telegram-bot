import { PromiseQueue } from '../utils/promiseQueue';
import { GetConfigFile, getConfigFile } from './wireguard';

//TODO set maximum keys limit when generating it
const MAX_KEYS_PER_USER = 3;

export class WireguardBotAdapter {
  private queue = new PromiseQueue();

  public async getWireguardConfig(): Promise<GetConfigFile> {
    return this.queue.enqueue(getConfigFile);
  }
}
