import { execChildProcess } from '../utils/cmd';
import {
  ClientConfig,
  parseWireguardConfig,
  serializeClientConfig,
  serializeWireguardConfig,
  WireguardConfig
} from './wireguardConfigUtils';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

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

//TODO replace. difficult to test - linux command (brew install iproute2mac not help) Not covered by tests!!!
export async function getServerIpV4(privatKey: string): Promise<string> {
  const serverIpV4 = await execChildProcess(
    `ip -4 addr | sed -ne 's|^.* inet \\([^/]*\\)/.* scope global.*$|\\1|p' | awk '{print $1}' | head -1`
  ).catch((err) => {
    throw new Error('Error during server ip v4 extraction');
  });
  return '1.1.1.1';
  // return serverIpV4;
}

// names longer then 15 symbols not supported!
export function generateClientFileName(
  serverName: string,
  userTgId: number,
  index: number
): string {
  const shortServerName = serverName.slice(0, 2);
  const res = shortServerName + '_' + userTgId.toString() + '_' + index.toString();
  if (res.length > 15) {
    throw new Error('Too long Client file name!');
  }
  return res;
}

export async function writeClientConfig(
  configObject: ClientConfig,
  fileName: string
): Promise<GetConfigFile> {
  const configFilePath = path.join(WG_PATH, WG_USERS_PATH, fileName);
  const serializedConfig = serializeClientConfig(configObject);
  await mkdir(path.join(WG_PATH, WG_USERS_PATH));
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
