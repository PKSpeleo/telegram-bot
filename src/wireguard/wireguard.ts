import { execChildProcess } from '../utils/cmd';
import {
  ClientConfig,
  countSameUsersIds,
  extractIpBases,
  findFirstFreeAddress,
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
}

const WG_PATH = '/etc/wireguard';
const WG_USERS_PATH = 'users';
const WG_CONFIG = 'wg0.conf';
const DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss (Z)';

// Do not use this functions directly!
// Use WireguardBotAdapter with queue inside.
export async function getConfig(): Promise<WireguardConfig> {
  const configFilePath = path.join(WG_PATH, WG_CONFIG);
  const configString = await readFile(configFilePath, 'utf8').catch((err) => {
    //TODO add to log file
    console.log('Error during file reading', err);
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
    //TODO add to log file
    console.log('Error during file writing', err);
  });
}

export async function getConfigFile(): Promise<GetConfigFile> {
  const configFilePath = path.join(WG_PATH, WG_CONFIG);
  const configString = await readFile(configFilePath, 'utf8').catch((err) => {
    //TODO add to log file
    console.log('Error during file reading', err);
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
  const publicKey = await execChildProcess(`wg syncconf wg0 <(wg-quick strip wg0)`).catch((err) => {
    throw new Error('Error during cong syncing.');
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
    //TODO add to log file
    console.log('Error during file writing', err);
  });

  return {
    fileName: fileName,
    filePath: configFilePath,
    content: serializedConfig
  };
}

//TODO cover by tests
export async function addClient(
  clientData: PeerDataConfig,
  serverIp: string,
  serverName: string
): Promise<GetConfigFile> {
  const wgConfigObject = await getConfig();
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
      Address: addressString
    },
    peer: {
      type: `[Peer]`,
      PublicKey: serverPubKey,
      PresharedKey: generatedKeys.PresharedKey,
      Endpoint: serverAddress,
      AllowedIPs: '0.0.0.0/0,::/0'
    }
  };

  const clientIndex = countSameUsersIds(wgConfigObject.peers, Number(clientData.userId));
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

  return {
    content: clientConfigFile.content,
    fileName: clientConfigFile.fileName,
    filePath: clientConfigFile.filePath
  };
}
