import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { sendMessagesToBosses } from './boss';

function getSendMessageMocker(chatId: number, message: string) {
  const promise = new Promise(function (resolve, reject) {
    switch (chatId) {
      case 1:
        resolve('');
        break;
      case 2:
        resolve('');
        break;
      case 3:
        reject(new Error('Rejected Error'));
        break;
      case 4:
        throw new Error('Thrown Error');
      default:
        reject(new Error('Rejected Error'));
    }
  });
  return promise;
}

const mockedBot = {
  telegram: {
    sendMessage: jest.fn().mockImplementation(getSendMessageMocker)
  }
} as unknown as Telegraf<Context<Update>>;
const sendMessageMock = mockedBot.telegram.sendMessage as jest.Mock;

describe('boss', () => {
  describe('sendMessagesToBosses', () => {
    beforeEach(() => {
      sendMessageMock.mockReset();
    });

    test('should message be sent to one boss', async () => {
      await sendMessagesToBosses([1], mockedBot, 'message_1');
      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith(1, 'message_1');
    });

    test('should message be sent to two bosses', async () => {
      await sendMessagesToBosses([1, 2], mockedBot, 'message_1');
      expect(sendMessageMock).toHaveBeenCalledTimes(2);
      expect(sendMessageMock).toHaveBeenCalledWith(1, 'message_1');
      expect(sendMessageMock).toHaveBeenCalledWith(2, 'message_1');
    });

    test('should message be sent to two bosses even with rejection and error', async () => {
      await sendMessagesToBosses([3, 4], mockedBot, 'message_1');
      expect(sendMessageMock).toHaveBeenCalledTimes(2);
      expect(sendMessageMock).toHaveBeenCalledWith(3, 'message_1');
      expect(sendMessageMock).toHaveBeenCalledWith(4, 'message_1');
    });
  });
});
