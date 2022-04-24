import { execChildProcess } from '../utils/cmd';
import {
  parseWireguardConfig,
  serializeWireguardConfig,
  WireguardConfig
} from './wireguardConfigUtils';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

interface Keys {
  PrivateKey: string;
  PublicKey: string;
  PresharedKey: string;
}

const WG_PATH = '/etc/wireguard';
const WG_CONFIG = 'wg0.conf';

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
