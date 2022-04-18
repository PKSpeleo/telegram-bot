import { execChildProcess } from './cmd';

describe('cmd', () => {
  test('should resolve if command exist', async () => {
    await expect(execChildProcess('ls')).resolves.not.toThrowError();
  });

  test('should reject if command not exist', async () => {
    await expect(execChildProcess('lasdasdsadfasfsf')).rejects.toThrowError();
  });

  test('should resolve with output', async () => {
    await expect(execChildProcess('ls')).resolves.toContain('package.json');
  });

  test('should rejects with error', async () => {
    await expect(execChildProcess('lasdasdsadfasfsf')).rejects.toThrowError('Command failed:');
  });

  test('should return value with await', async () => {
    const dirContent = await execChildProcess('ls');
    expect(dirContent).toContain('package.json');
  });

  test('should catch error with await', async () => {
    let error = new Error();
    await execChildProcess('lasdasdsadfasfsf').catch((err) => {
      error = err;
    });
    expect(error.message).toContain('Command failed:');
  });
});
