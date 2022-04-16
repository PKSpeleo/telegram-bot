import { PromiseQueue } from './promiseQueue';

let queue: PromiseQueue;

const mockSpy = jest.fn();

function flushPromises() {
  return new Promise(jest.requireActual('timers').setImmediate);
}

function mockResolvedFunction(index: string, time: number): jest.Mock<any, any> {
  return jest.fn().mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        mockSpy(`Started promise ${index}`);
        setTimeout(() => resolve(`resolve_value_${index}`), time);
      })
  );
}

function mockRejectedFunction(index: string, time: number): jest.Mock<any, any> {
  return jest.fn().mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        mockSpy(`Started promise ${index}`);
        setTimeout(() => reject(`reject_value_${index}`), time);
      })
  );
}

describe('promiseQueue', () => {
  beforeEach(() => {
    queue = new PromiseQueue();
    mockSpy.mockReset();
    jest.useFakeTimers();
  });

  it.skip('should run playground with real timers', async () => {
    jest.useRealTimers();
    await expect(queuePlayground(queue)).resolves.not.toThrow();
  });

  it('should handle one resolved item', async () => {
    mockSpy('Enqueue promise 1');
    queue.enqueue(mockResolvedFunction('1', 10)).then((value) => {
      mockSpy(`Promise 1 finished with ${value}`);
    });
    jest.advanceTimersByTime(10);
    await flushPromises();
    expect(mockSpy).toHaveBeenCalledTimes(3);
    expect(mockSpy).toHaveBeenNthCalledWith(1, 'Enqueue promise 1');
    expect(mockSpy).toHaveBeenNthCalledWith(2, 'Started promise 1');
    expect(mockSpy).toHaveBeenNthCalledWith(3, 'Promise 1 finished with resolve_value_1');
  });

  it('should handle two resolved items with correct order', async () => {
    mockSpy('Enqueue promise 1');
    queue.enqueue(mockResolvedFunction('1', 30)).then((value) => {
      mockSpy(`Promise 1 finished with ${value}`);
    });
    mockSpy('Enqueue promise 2');
    queue.enqueue(mockResolvedFunction('2', 20)).then((value) => {
      mockSpy(`Promise 2 finished with ${value}`);
    });
    jest.advanceTimersByTime(30);
    await flushPromises();
    jest.advanceTimersByTime(20);
    await flushPromises();
    expect(mockSpy).toHaveBeenCalledTimes(6);
    expect(mockSpy).toHaveBeenNthCalledWith(1, 'Enqueue promise 1');
    expect(mockSpy).toHaveBeenNthCalledWith(2, 'Started promise 1');
    expect(mockSpy).toHaveBeenNthCalledWith(3, 'Enqueue promise 2');
    expect(mockSpy).toHaveBeenNthCalledWith(4, 'Promise 1 finished with resolve_value_1');
    expect(mockSpy).toHaveBeenNthCalledWith(5, 'Started promise 2');
    expect(mockSpy).toHaveBeenNthCalledWith(6, 'Promise 2 finished with resolve_value_2');
  });

  it('should handle two resolved items with correct order and rejected in the middle', async () => {
    mockSpy('Enqueue promise 1');
    queue.enqueue(mockResolvedFunction('1', 50)).then((value) => {
      mockSpy(`Promise 1 finished with ${value}`);
    });
    mockSpy('Enqueue promise 2');
    queue.enqueue(mockRejectedFunction('2', 20)).catch((value) => {
      mockSpy(`Promise 2 rejected with ${value}`);
    });
    mockSpy('Enqueue promise 3');
    queue.enqueue(mockResolvedFunction('3', 10)).then((value) => {
      mockSpy(`Promise 3 finished with ${value}`);
    });
    jest.advanceTimersByTime(50);
    await flushPromises();
    jest.advanceTimersByTime(20);
    await flushPromises();
    jest.advanceTimersByTime(10);
    await flushPromises();
    expect(mockSpy).toHaveBeenCalledTimes(9);
    expect(mockSpy).toHaveBeenNthCalledWith(1, 'Enqueue promise 1');
    expect(mockSpy).toHaveBeenNthCalledWith(2, 'Started promise 1');
    expect(mockSpy).toHaveBeenNthCalledWith(3, 'Enqueue promise 2');
    expect(mockSpy).toHaveBeenNthCalledWith(4, 'Enqueue promise 3');
    expect(mockSpy).toHaveBeenNthCalledWith(5, 'Promise 1 finished with resolve_value_1');
    expect(mockSpy).toHaveBeenNthCalledWith(6, 'Started promise 2');
    expect(mockSpy).toHaveBeenNthCalledWith(7, 'Promise 2 rejected with reject_value_2');
    expect(mockSpy).toHaveBeenNthCalledWith(8, 'Started promise 3');
    expect(mockSpy).toHaveBeenNthCalledWith(9, 'Promise 3 finished with resolve_value_3');
  });
});

async function queuePlayground(queue: any) {
  console.log('Enqueue promise 1');
  queue.enqueue(() =>
    new Promise((resolve, reject) => {
      console.log('Promise 1 started');
      setTimeout(() => resolve(111), 200);
    }).then((value) => {
      console.log(`Promise 1 returned ${value}`);
    })
  );

  console.log('Enqueue promise 2');
  queue
    .enqueue(
      () =>
        new Promise((resolve, reject) => {
          console.log('Promise 2 started');
          setTimeout(() => resolve(42), 300);
        })
    )
    .then((value: any) => {
      console.log(`Promise 2 returned ${value}`);
    });

  console.log('Enqueue promise 3');
  await queue
    .enqueue(
      () =>
        new Promise((resolve, reject) => {
          console.log('Promise 3 started');
          setTimeout(() => reject(new Error('Test')), 100);
        })
    )
    .catch((err: any) => {
      console.log('Catched error from promise 3:', err);
    });

  console.log('Enqueue promise 4');
  await queue.enqueue(
    () =>
      new Promise((resolve, reject) => {
        console.log('Promise 4 started');
        setTimeout(resolve, 300);
      })
  );

  console.log('Done');
}
