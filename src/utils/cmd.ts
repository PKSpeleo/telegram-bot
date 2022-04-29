import * as child_process from 'child_process';

export async function execChildProcess(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.exec(
      cmd,
      {
        shell: 'bash'
      },
      (err, stdout) => {
        if (err) {
          reject(err);
        }
        resolve(String(stdout).trim());
      }
    );
  });
}
