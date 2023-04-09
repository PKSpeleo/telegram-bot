import { execChildProcess } from '../utils/cmd';
import {
  ClientConfig,
  countSameUsersIds,
  extractIpBases,
  findFirstFreeAddress,
  getKeyFilesForUserId,
  parseWireguardConfig,
  PeerConfig,
  PeerDataConfig,
  serializeClientConfig,
  serializeWireguardConfig,
  WireguardConfig
} from './wireguardConfigUtils';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';

interface Keys {
  PrivateKey: string;
  PublicKey: string;
  PresharedKey: string;
}

export interface GetConfigFile {
  content: string;
  fileName: string;
  filePath: string;
  additionalData?: {
    isKeysNumberLimitExceeded?: boolean;
    currentKeyNumber?: number;
  };
}

export interface UsersStats {
  rawData: PeerConfig[];
  usersMap: Map<string, PeerConfig[]>;
  telegramUsersIds: string[];
  stats: {
    totalUsers: number;
    totalUniqueUsers: number;
    totalTelegramUsers: number;
    usersWithOneKey: number;
    usersWithTwoKeys: number;
    usersWithThreeKeys: number;
    usersWithFourAndMoreKeys: number;
  };
}

const WG_PATH = '/etc/wireguard';
const WG_USERS_PATH = 'users';
const WG_BACKUP_PATH = 'backup';
const WG_CONFIG = 'wg0.conf';
const WG_KEY_USER_PAIRS_FAIL_NAME = 'key-user-pairs.txt';
const DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss (Z)';

// Do not use this functions directly!
// Use WireguardBotAdapter with queue inside.
export async function getConfig(): Promise<WireguardConfig> {
  const configFilePath = path.join(WG_PATH, WG_CONFIG);
  const configString = await readFile(configFilePath, 'utf8').catch((err) => {
    throw new Error(`Error during file reading: ${err}`);
  });
  if (!configString || configString == '') {
    throw new Error('Empty config file');
  }
  const configObject = parseWireguardConfig(configString);
  return configObject;
}

export async function writeConfig(configObject: WireguardConfig): Promise<void> {
  const configFilePath = path.join(WG_PATH, WG_CONFIG);
  const serializedConfig = serializeWireguardConfig(configObject);
  await writeFile(configFilePath, serializedConfig).catch((err) => {
    throw new Error(`Error during file writing: ${err}`);
  });
}

export async function getConfigFile(): Promise<GetConfigFile> {
  const configFilePath = path.join(WG_PATH, WG_CONFIG);
  const configString = await readFile(configFilePath, 'utf8').catch((err) => {
    throw new Error(`Error during file reading: ${err}`);
  });
  if (!configString || configString == '') {
    throw new Error('Empty config file');
  }
  return {
    content: configString,
    fileName: WG_CONFIG,
    filePath: configFilePath
  };
}

export async function generateKeys(): Promise<Keys> {
  const privateKey = await execChildProcess('wg genkey');
  const publicKey = await execChildProcess(`echo ${privateKey} | wg pubkey`);
  const preSharedKey = await execChildProcess('wg genpsk');
  return {
    PrivateKey: privateKey,
    PublicKey: publicKey,
    PresharedKey: preSharedKey
  };
}

export async function generatePubKey(privatKey: string): Promise<string> {
  const publicKey = await execChildProcess(`echo ${privatKey} | wg pubkey`).catch((err) => {
    throw new Error('Error during pubKey generation');
  });
  return publicKey;
}

export async function syncConfig(): Promise<void> {
  await execChildProcess('wg syncconf wg0 <(wg-quick strip wg0)').catch((err) => {
    throw new Error(`Error during conf syncing. ${err}`);
  });
}

// names longer then 15 symbols not supported!
export function generateClientFileName(
  serverName: string,
  userTgId: number,
  index: number
): string {
  const shortServerName = serverName.slice(0, 2);
  const res = shortServerName + '_' + userTgId.toString() + '_' + (index + 1).toString();
  if (res.length > 15) {
    throw new Error('Too long Client file name!');
  }
  return res + '.conf';
}

//TODO decide what to do if client was deleted from config but client config exist. Right now it is overwritten and existing file will be lost. Reproduce: add 3 times, manually remove middle peer from config, but keep file, add another one client - third file will be overwritten, but not valid - second.
export async function writeClientConfig(
  configObject: ClientConfig,
  fileName: string
): Promise<GetConfigFile> {
  const configFilePath = path.join(WG_PATH, WG_USERS_PATH, fileName);
  const serializedConfig = serializeClientConfig(configObject);
  await mkdir(path.join(WG_PATH, WG_USERS_PATH), { recursive: true });
  await writeFile(configFilePath, serializedConfig).catch((err) => {
    throw new Error(`Error during file writing: ${err}`);
  });

  return {
    fileName: fileName,
    filePath: configFilePath,
    content: serializedConfig
  };
}

//TODO cover by tests
//TODO Revert all changes if failed
export async function addClient(
  clientData: PeerDataConfig,
  serverIp: string,
  serverName: string,
  DNSServers: string[],
  maximumNumberOfKeys?: number
): Promise<GetConfigFile> {
  const wgConfigObject = await getConfig();

  const clientIndex = countSameUsersIds(wgConfigObject.peers, Number(clientData.userId));
  if (maximumNumberOfKeys && clientIndex >= maximumNumberOfKeys) {
    return {
      content: '',
      fileName: '',
      filePath: '',
      additionalData: {
        isKeysNumberLimitExceeded: true,
        currentKeyNumber: clientIndex
      }
    };
  }

  const generatedKeys = await generateKeys();
  const serverPrivateKey = wgConfigObject.interface.config.PrivateKey;
  const serverPubKey = await generatePubKey(serverPrivateKey);
  const currentDateString = dayjs().format(DATE_FORMAT);
  const serverAddress = serverIp + ':' + wgConfigObject.interface.config.ListenPort;
  const freeIp = findFirstFreeAddress(wgConfigObject.peers);
  const baseIp = extractIpBases(wgConfigObject.interface.config.Address);
  const addressString = baseIp.v4 + freeIp + '/32' + ',' + baseIp.v6 + freeIp + '/128';

  const dataForClientConfigUpdate: ClientConfig = {
    interface: {
      type: '[Interface]',
      PrivateKey: generatedKeys.PrivateKey,
      Address: addressString,
      DNS: DNSServers
    },
    peer: {
      type: `[Peer]`,
      PublicKey: serverPubKey,
      PresharedKey: generatedKeys.PresharedKey,
      Endpoint: serverAddress,
      AllowedIPs: '0.0.0.0/0,::/0',
      PersistentKeepalive: '23'
    }
  };

  const clientFileName = generateClientFileName(serverName, Number(clientData.userId), clientIndex);
  const clientConfigFile = await writeClientConfig(dataForClientConfigUpdate, clientFileName);

  const dataForServerConfigUpdate: PeerConfig = {
    config: {
      AllowedIPs: addressString,
      PresharedKey: generatedKeys.PresharedKey,
      PublicKey: generatedKeys.PublicKey
    },
    data: {
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      userName: clientData.userName,
      userId: clientData.userId,
      lastUpdate: currentDateString,
      fileName: clientConfigFile.fileName
    },
    title: 'Client',
    type: '[Peer]'
  };

  wgConfigObject.peers.push(dataForServerConfigUpdate);
  await writeConfig(wgConfigObject);

  await syncConfig();

  await createBackup(serverName);

  return {
    content: clientConfigFile.content,
    fileName: clientConfigFile.fileName,
    filePath: clientConfigFile.filePath,
    additionalData: {
      currentKeyNumber: clientIndex + 1
    }
  };
}

export async function deleteClients(clientsForDelete: string[], serverName: string): Promise<void> {
  const wgConfigObject = await getConfig();

  wgConfigObject.peers = wgConfigObject.peers.filter((peer) => {
    if (peer.data?.userId) {
      return !clientsForDelete.includes(peer.data.userId);
    } else {
      return true;
    }
  });

  await writeConfig(wgConfigObject);

  await syncConfig();

  await createBackup(serverName);
}

//TODO not cowered by tests. Solve this problem (mock cmd?)
export async function createBackup(serverName: string): Promise<GetConfigFile> {
  const backupPath = path.join(WG_PATH, WG_BACKUP_PATH);
  const backupFileName = serverName + '__' + dayjs().format('YYYY-MM-DD__HH-mm-ss-SSS');
  const backupFilePath = path.join(backupPath, backupFileName);
  await mkdir(backupPath, { recursive: true });
  await execChildProcess(
    `cd ${WG_PATH} && zip -r ${backupFilePath} ./ -i '*params*' '*.conf'`
  ).catch((err) => {
    throw new Error(`Error during backup: ${err}`);
  });
  return {
    fileName: backupFileName + '.zip',
    filePath: backupFilePath + '.zip',
    content: ''
  };
}

export async function getKeyFilePathsForUserId(userId: number): Promise<string[]> {
  const config = await getConfig();
  const userFileNames = getKeyFilesForUserId(config.peers, userId);
  const userFilePats = userFileNames.map((fileName) => path.join(WG_PATH, WG_USERS_PATH, fileName));
  return userFilePats;
}

export async function getKeyUserPairs(): Promise<GetConfigFile> {
  const keyUserPairsFilePath = path.join(WG_PATH, WG_USERS_PATH, WG_KEY_USER_PAIRS_FAIL_NAME);

  const config = await getConfig();
  const clientKeyUserPairs: string[] = [];

  config.peers.forEach((peer) => {
    const key = peer.config.PublicKey;
    let name = '';

    if (peer.data?.userName) {
      name = peer.data.userName.trim();
    }

    if (peer.data?.firstName) {
      name = (name + ' ' + peer.data.firstName).trim();
    }

    if (peer.data?.lastName) {
      name = (name + ' ' + peer.data.lastName).trim();
    }

    if (name.trim().length === 0) {
      name = 'Undefined';
    }

    clientKeyUserPairs.push(`"${key}","${name}"`);
  });

  const serializedPairs = clientKeyUserPairs.join('\n');

  await mkdir(path.join(WG_PATH, WG_USERS_PATH), { recursive: true });
  await writeFile(keyUserPairsFilePath, serializedPairs).catch((err) => {
    throw new Error(`Error during file writing: ${err}`);
  });

  return {
    fileName: WG_KEY_USER_PAIRS_FAIL_NAME,
    filePath: keyUserPairsFilePath,
    content: ''
  };
}

export async function getUsersStats(): Promise<UsersStats> {
  const config = await getConfig();
  const usersMap = new Map<string, PeerConfig[]>();
  const rawData = config.peers;
  const totalUsers = rawData.length;
  const telegramUsersIds: string[] = [];
  let usersWithOneKey = 0;
  let usersWithTwoKeys = 0;
  let usersWithThreeKeys = 0;
  let usersWithFourAndMoreKeys = 0;

  rawData.forEach((peer) => {
    if (peer.data?.userId) {
      telegramUsersIds.push(peer.data.userId);
    }
    const userId = peer.data?.userId || 'Unknown';
    if (usersMap.has(userId)) {
      const usersPeers = usersMap.get(userId) || [];
      usersPeers.push(peer);
      usersMap.set(userId, usersPeers);
    } else {
      usersMap.set(userId, [peer]);
    }
  });

  const totalUniqueUsers = usersMap.size;
  usersMap.forEach((peers, userId) => {
    switch (peers.length) {
      case 1:
        usersWithOneKey++;
        break;
      case 2:
        usersWithTwoKeys++;
        break;
      case 3:
        usersWithThreeKeys++;
        break;
      default:
        usersWithFourAndMoreKeys++;
        break;
    }
  });

  return {
    rawData,
    usersMap,
    telegramUsersIds,
    stats: {
      totalUsers,
      totalTelegramUsers: telegramUsersIds.length,
      totalUniqueUsers,
      usersWithOneKey,
      usersWithTwoKeys,
      usersWithThreeKeys,
      usersWithFourAndMoreKeys
    }
  };
}
