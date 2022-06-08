import {
  generateClientFileName,
  generateKeys,
  generatePubKey,
  getConfig,
  getConfigFile,
  getKeyUserPairs,
  getUsersStats,
  writeClientConfig,
  writeConfig
} from './wireguard';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { fs, vol } from 'memfs';
import {
  mockedConfig,
  parsedClientConfig,
  parsedConfig,
  serializedClientConfig
} from './wireguardConfigUtils.spec';

jest.mock('fs/promises');

describe('Wireguard', () => {
  beforeEach(() => {
    (readFile as jest.Mock).mockImplementation(fs.promises.readFile);
    (writeFile as jest.Mock).mockImplementation(fs.promises.writeFile);
    (mkdir as jest.Mock).mockImplementation(fs.promises.mkdir);

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

  test('generateClientFileName', async () => {
    const res = generateClientFileName('NLLLLLLL', 1234567890, 1);
    expect(res).toEqual('NL_1234567890_2.conf');
  });

  test('writeClientConfig', async () => {
    const res = await writeClientConfig(parsedClientConfig, 'test_name.conf');

    expect(await fs.promises.readFile('/etc/wireguard/users/test_name.conf', 'utf8')).toEqual(
      serializedClientConfig
    );

    expect(res).toEqual({
      content: serializedClientConfig,
      fileName: 'test_name.conf',
      filePath: '/etc/wireguard/users/test_name.conf'
    });
  });

  test('getKeyUserPairs', async () => {
    const res = await getKeyUserPairs();

    expect(res).toEqual({
      content: '',
      fileName: 'key-user-pairs.txt',
      filePath: '/etc/wireguard/users/key-user-pairs.txt'
    });

    expect(await fs.promises.readFile('/etc/wireguard/users/key-user-pairs.txt', 'utf8')).toEqual(
      '"dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf", "tru-la-la-1 la-la-tru-2 last name"\n' +
        '"dafkjs;fvmn,xcnvioqur0uwer[ujfas=", "tru-la-la-3 la-la-tru-4"\n' +
        '"Yasdfkjsfk;auwioetrhjfds", "tru-la-la-5 la-la-tru-6"\n' +
        '"dsfjhiueorpwtjkghiuopfjaklsgdhioutpwjerklghsdfi", "Undefined"'
    );
  });

  test('getUsersStats', async () => {
    const res = await getUsersStats();

    expect(res).toEqual(
      expect.objectContaining({
        rawData: parsedConfig.peers,
        stats: {
          totalUsers: 4,
          totalUniqueUsers: 2,
          usersWithOneKey: 1,
          usersWithTwoKeys: 0,
          usersWithThreeKeys: 1,
          usersWithFourAndMoreKeys: 0
        }
      })
    );
  });
});
