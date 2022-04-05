import { extractEnv } from './extractEnv';

function setTestEnv(currentName: string) {
  process.env.BOT_CURRENT_NAME = currentName;
  process.env.BOT_SETTINGS_NL =
    '{"NAME":"NL","TOKEN":"121212121212","ADMIN_ID":"1111","SUPPORTED_CHAT_ID":"-1111","SERVER_FOR_PING":"111.111.111.111","DEBUG":"true","URL":"www"}';
  process.env.BOT_SETTINGS_DE =
    '{"NAME":"DE","TOKEN":"3434343434343434","ADMIN_ID":"22222","SUPPORTED_CHAT_ID":"-222222","SERVER_FOR_PING":"222.222.222.222","DEBUG":"true","URL":"www"}';
}

describe('extractEnv', () => {
  test('should should extract NL env', () => {
    setTestEnv('NL');
    expect(extractEnv()).toEqual(
      expect.objectContaining({
        ADMIN_ID: 1111,
        DEBUG: true,
        SERVER_FOR_PING: '111.111.111.111',
        SUPPORTED_CHAT_ID: -1111,
        TOKEN: '121212121212',
        NAME: 'NL'
      })
    );
  });

  test('should should extract RUS env', () => {
    setTestEnv('DE');
    expect(extractEnv()).toEqual(
      expect.objectContaining({
        ADMIN_ID: 22222,
        DEBUG: true,
        SERVER_FOR_PING: '222.222.222.222',
        SUPPORTED_CHAT_ID: -222222,
        TOKEN: '3434343434343434',
        NAME: 'DE'
      })
    );
  });
});
