import { execChildProcess } from '../utils/cmd';
import {
  parseWireguardConfig,
  serializeWireguardConfig,
  WireguardConfig
} from './wireguardConfigUtils';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { throws } from 'assert';

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
