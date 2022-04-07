import { extractEnv } from './extractEnv';

function setTestEnv(currentName: string) {
  process.env.BOT_CURRENT_NAME = currentName;
  process.env.BOT_SETTINGS_SINGLE =
    '{"ADMIN_ID":[3333],"DEBUG":"true","SERVER_FOR_PING":[{"NAME":"SERV_333","ADDRESS":"333.333.333.333"}],"SUPPORTED_CHAT_ID":[-444444],"TOKEN":"3434343434343434","NAME":"SINGLE"}';
  process.env.BOT_SETTINGS_MULTI =
    '{"ADMIN_ID":[1111,2222],"DEBUG":"true","SERVER_FOR_PING":[{"NAME":"SERV_111","ADDRESS":"111.111.111.111"},{"NAME":"SERV_222","ADDRESS":"222.222.222.222"}],"SUPPORTED_CHAT_ID":[-11111,-22222],"TOKEN":"121212121212","NAME":"MULTI"}';
}

describe('extractEnv', () => {
  test('should extract SINGLE env with admins arrays', () => {
    setTestEnv('SINGLE');
    expect(extractEnv()).toEqual(
      expect.objectContaining({
        ADMIN_ID: [3333],
        DEBUG: true,
        SERVER_FOR_PING: [{ NAME: 'SERV_333', ADDRESS: '333.333.333.333' }],
        SUPPORTED_CHAT_ID: [-444444],
        TOKEN: '3434343434343434',
        NAME: 'SINGLE'
      })
    );
  });

  test('should extract MULTI env with admins array', () => {
    setTestEnv('MULTI');
    expect(extractEnv()).toEqual(
      expect.objectContaining({
        ADMIN_ID: [1111, 2222],
        DEBUG: true,
        SERVER_FOR_PING: [
          { NAME: 'SERV_111', ADDRESS: '111.111.111.111' },
          { NAME: 'SERV_222', ADDRESS: '222.222.222.222' }
        ],
        SUPPORTED_CHAT_ID: [-11111, -22222],
        TOKEN: '121212121212',
        NAME: 'MULTI'
      })
    );
  });
});
