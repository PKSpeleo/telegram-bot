import { extractRights } from './rights';

describe('extractRights', () => {
  test('should isAdmin to be falsy and isSupportedChat to be falsy if empty arrays', () => {
    const ctx = {
      from: {
        id: 11111
      },
      chat: {
        id: -22222
      }
    };
    const botProperties = {
      ADMIN_ID: [],
      SUPPORTED_CHAT_ID: []
    };
    const { isAdmin, isSupportedChat } = extractRights(ctx, botProperties);
    expect(isAdmin).toBeFalsy();
    expect(isSupportedChat).toBeFalsy();
  });

  test('should isAdmin to be falsy and isSupportedChat to be falsy if not empty arrays', () => {
    const ctx = {
      from: {
        id: 11111
      },
      chat: {
        id: -22222
      }
    };
    const botProperties = {
      ADMIN_ID: [1, 2, 3],
      SUPPORTED_CHAT_ID: [22222, 5, 6]
    };
    const { isAdmin, isSupportedChat } = extractRights(ctx, botProperties);
    expect(isAdmin).toBeFalsy();
    expect(isSupportedChat).toBeFalsy();
  });

  test('should isAdmin to be truthy and isSupportedChat to be truthy if not empty arrays with needed values', () => {
    const ctx = {
      from: {
        id: 11111
      },
      chat: {
        id: -22222
      }
    };
    const botProperties = {
      ADMIN_ID: [11111, 2, 3],
      SUPPORTED_CHAT_ID: [4, -22222, 6]
    };
    const { isAdmin, isSupportedChat } = extractRights(ctx, botProperties);
    expect(isAdmin).toBeTruthy();
    expect(isSupportedChat).toBeTruthy();
  });
});
