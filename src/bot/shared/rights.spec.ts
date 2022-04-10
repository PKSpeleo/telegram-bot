import { extractRights } from './rights';
import { BotContext, BotProperties, USER_STATUSES } from './interfaces';

function getChatMemberMocker(chatId: number, userId: number) {
  const promise = new Promise(function (resolve, reject) {
    switch (chatId) {
      case -1:
        resolve({ status: USER_STATUSES.CREATOR });
        break;
      case -2:
        resolve({ status: USER_STATUSES.ADMINISTRATOR });
        break;
      case -3:
        resolve({ status: USER_STATUSES.MEMBER });
        break;
      case -4:
        resolve({ status: USER_STATUSES.RESTRICTED });
        break;
      case -5:
        resolve({ status: USER_STATUSES.LEFT });
        break;
      case -6:
        resolve({ status: USER_STATUSES.BANNED });
        break;
      case -7:
        reject(new Error('Rejected Error'));
        break;
      case -8:
        throw new Error('Thrown Error');
      default:
        reject(new Error('Rejected Error'));
    }
  });
  return promise;
}

function createMockedContext(
  userId: number,
  chatId: number,
  getChatMemberMockFunction: any = getChatMemberMocker
) {
  return {
    from: {
      id: userId
    },
    chat: {
      id: chatId
    },
    telegram: {
      getChatMember: jest.fn().mockImplementation(getChatMemberMockFunction)
    }
  } as any as BotContext;
}

function createMockedBotProperties(adminIds: number[], supportedChatIds: number[]) {
  return {
    ADMIN_ID: adminIds,
    SUPPORTED_CHAT_ID: supportedChatIds
  } as BotProperties;
}

describe('extractRights', () => {
  describe('isAdmin', () => {
    test('should be false for empty admins array', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], []);
      const { isAdmin } = await extractRights(ctx, botProperties);
      expect(isAdmin).toBeFalsy();
    });

    test('should be false if one admin', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([2], []);
      const { isAdmin } = await extractRights(ctx, botProperties);
      expect(isAdmin).toBeFalsy();
    });

    test('should be false if many admins', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([2, 3, 4], []);
      const { isAdmin } = await extractRights(ctx, botProperties);
      expect(isAdmin).toBeFalsy();
    });

    test('should be true if admin only one', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([1], []);
      const { isAdmin } = await extractRights(ctx, botProperties);
      expect(isAdmin).toBeTruthy();
    });

    test('should be true if many admins', async () => {
      const ctx = createMockedContext(2, 2);
      const botProperties = createMockedBotProperties([1, 2, 3], []);
      const { isAdmin } = await extractRights(ctx, botProperties);
      expect(isAdmin).toBeTruthy();
    });
  });

  describe('isSupportedChat', () => {
    test('should be false for empty chats array', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], []);
      const { isSupportedChat } = await extractRights(ctx, botProperties);
      expect(isSupportedChat).toBeFalsy();
    });

    test('should be false if one chat', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [3]);
      const { isSupportedChat } = await extractRights(ctx, botProperties);
      expect(isSupportedChat).toBeFalsy();
    });

    test('should be false if many chats', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [1, 3, 4]);
      const { isSupportedChat } = await extractRights(ctx, botProperties);
      expect(isSupportedChat).toBeFalsy();
    });

    test('should be true if chat only one', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [2]);
      const { isSupportedChat } = await extractRights(ctx, botProperties);
      expect(isSupportedChat).toBeTruthy();
    });

    test('should be true if many chats', async () => {
      const ctx = createMockedContext(2, 2);
      const botProperties = createMockedBotProperties([], [1, 2, 3]);
      const { isSupportedChat } = await extractRights(ctx, botProperties);
      expect(isSupportedChat).toBeTruthy();
    });
  });

  describe('isUserMemberOfSupportedChats', () => {
    test('should return true for Creator', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-1]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-1, 1);
      expect(isUserMemberOfSupportedChats).toBeTruthy();
    });

    test('should return true for Administrator', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-2]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-2, 1);
      expect(isUserMemberOfSupportedChats).toBeTruthy();
    });

    test('should return true for Member', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-3]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-3, 1);
      expect(isUserMemberOfSupportedChats).toBeTruthy();
    });

    test('should return false for Restricted', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-4]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-4, 1);
      expect(isUserMemberOfSupportedChats).toBeFalsy();
    });

    test('should return false for Left', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-5]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-5, 1);
      expect(isUserMemberOfSupportedChats).toBeFalsy();
    });

    test('should return false for Kicked', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-6]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-6, 1);
      expect(isUserMemberOfSupportedChats).toBeFalsy();
    });

    test('should return false for any Rejected promise', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-7]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-7, 1);
      expect(isUserMemberOfSupportedChats).toBeFalsy();
    });

    test('should return false for thrown by promise Error', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-8]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenCalledWith(-8, 1);
      expect(isUserMemberOfSupportedChats).toBeFalsy();
    });

    test('should return true if all chats supported', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-1, -2, -3]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(1, -1, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(2, -2, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(3, -3, 1);
      expect(isUserMemberOfSupportedChats).toBeTruthy();
    });

    test('should return true if at least one chat supported', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-4, -2, -5]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(1, -4, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(2, -2, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(3, -5, 1);
      expect(isUserMemberOfSupportedChats).toBeTruthy();
    });

    test('should return true if at least one chat supported and other rejected or thrown error', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-7, -2, -8]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(1, -7, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(2, -2, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(3, -8, 1);
      expect(isUserMemberOfSupportedChats).toBeTruthy();
    });

    test('should return false if all chats not supported', async () => {
      const ctx = createMockedContext(1, 2);
      const botProperties = createMockedBotProperties([], [-4, -5, -6, -7, -8]);
      const { isUserMemberOfSupportedChats } = await extractRights(ctx, botProperties);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(1, -4, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(2, -5, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(3, -6, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(4, -7, 1);
      expect(ctx.telegram.getChatMember).toHaveBeenNthCalledWith(5, -8, 1);
      expect(isUserMemberOfSupportedChats).toBeFalsy();
    });
  });
});
