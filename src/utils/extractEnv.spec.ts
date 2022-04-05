import { extractEnv } from './extractEnv';

function setTestEnv() {
  process.env.BOT_ADMIN_ID = '1111111';
  process.env.BOT_DEBUG = 'true';
  process.env.BOT_SERVER_FOR_PING = '111.11.11.11';
  process.env.BOT_TOKEN = 'aaaaaaaaaaaaaaaaaa';
  process.env.BOT_URL = 't.me/NPV_PK_DEV_BOT';
  process.env.BOT_SUPPORTED_CHAT_ID = '-99999999';
}

describe('extractEnv', () => {
  test('should should extract env', () => {
    setTestEnv();
    expect(extractEnv()).toEqual(
      expect.objectContaining({
        ADMIN_ID: 1111111,
        DEBUG: true,
        SERVER_FOR_PING: '111.11.11.11',
        SUPPORTED_CHAT_ID: -99999999,
        TOKEN: 'aaaaaaaaaaaaaaaaaa'
      })
    );
  });
});
