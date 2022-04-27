import { generateKeys, generatePubKey, getConfig, getConfigFile, writeConfig } from './wireguard';
import { readFile, writeFile } from 'fs/promises';
import { fs, vol } from 'memfs';
import { mockedConfig, parsedConfig } from './wireguardConfigUtils.spec';

jest.mock('fs/promises');

describe('Wireguard', () => {
  beforeEach(() => {
    (readFile as jest.Mock).mockImplementation(fs.promises.readFile);
    (writeFile as jest.Mock).mockImplementation(fs.promises.writeFile);

    const json = {
      '/etc/wireguard/wg0.conf': mockedConfig
    };
    vol.fromJSON(json);
  });

  test('generateKeys', async () => {
    const result = await generateKeys();
    expect(result.PublicKey.length).toEqual(44);
    expect(result.PresharedKey.length).toEqual(44);
    expect(result.PrivateKey.length).toEqual(44);
  });

  test('generatePubKey', async () => {
    const result = await generatePubKey('VEILqrzP5Cg60khTnLSlapFDKewcsiAznJhSoF8QTS8=');
    expect(result).toEqual('x5Nmp1rqxgKk4PdVNPhNvjqM3C4VEkpSfyZSEQYZE30=');
  });

  test('getConfig', async () => {
    const res = await getConfig();
    expect(res).toEqual(parsedConfig);
  });

  test('getConfigFile', async () => {
    const res = await getConfigFile();
    expect(res).toEqual({
      content: mockedConfig,
      fileName: 'wg0.conf',
      filePath: '/etc/wireguard/wg0.conf'
    });
  });

  test('writeConfig', async () => {
    const json = {
      '/etc/wireguard/wg0.conf': '123'
    };
    vol.fromJSON(json);

    expect(await fs.promises.readFile('/etc/wireguard/wg0.conf', 'utf8')).toEqual('123');

    await writeConfig(parsedConfig);

    expect(await fs.promises.readFile('/etc/wireguard/wg0.conf', 'utf8')).toEqual(mockedConfig);
  });
});
