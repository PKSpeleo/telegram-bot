import { PromiseQueue } from '../utils/promiseQueue';
import {
  addClient,
  createBackup,
  GetConfigFile,
  getKeyFilePathsForUserId,
  getKeyUserPairs,
  getUsersStats,
  UsersStats,
  deleteClients
} from './wireguard';
import { BotContext, BotProperties } from '../bot/shared/interfaces';
import { PeerDataConfig } from './wireguardConfigUtils';

//TODO set maximum keys limit when generating it

export class WireguardBotAdapter {
  private queue = new PromiseQueue();

  public async getUsersKeysPaths(userId: number): Promise<string[]> {
    function createGetKeyFilePathsForUserId() {
      return getKeyFilePathsForUserId(userId);
    }
    return this.queue.enqueue(createGetKeyFilePathsForUserId);
  }

  public async getBackup(serverName: string): Promise<GetConfigFile> {
    function createGetBackupFunction() {
      return createBackup(serverName);
    }
    return this.queue.enqueue(createGetBackupFunction);
  }

  public async addClient(
    botProperties: BotProperties,
    ctx: BotContext,
    maximumNumberOfKeys?: number
  ): Promise<GetConfigFile> {
    const dataForPeerConfig: PeerDataConfig = {
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      userName: ctx.from.username,
      userId: ctx.from.id.toString()
    };

    function createAddClientFunction() {
      return addClient(
        dataForPeerConfig,
        botProperties.SERVER_IP,
        botProperties.NAME,
        botProperties.DNS_SERVERS,
        maximumNumberOfKeys
      );
    }
    return this.queue.enqueue(createAddClientFunction);
  }

  public async deleteClients(
    botProperties: BotProperties,
    clientsForDelete: string[]
  ): Promise<void> {
    function createDeleteClientsFunction() {
      return deleteClients(clientsForDelete, botProperties.NAME);
    }
    return this.queue.enqueue(createDeleteClientsFunction);
  }

  public async getKeyUserPairsFile(): Promise<GetConfigFile> {
    function createGetKeyUserPairsFileFunction() {
      return getKeyUserPairs();
    }
    return this.queue.enqueue(createGetKeyUserPairsFileFunction);
  }

  public async getUsersStats(): Promise<UsersStats> {
    function createGetUsersStatsFunction() {
      return getUsersStats();
    }
    return this.queue.enqueue(createGetUsersStatsFunction);
  }
}
