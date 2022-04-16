import { PromiseQueue } from './promiseQueue';
import * as fs from 'fs';
import dayjs from 'dayjs';
import chalk from 'chalk';

export class Logger {
  private DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss (Z)';
  private logFileQueue = new PromiseQueue();

  private getLocalDateString(): string {
    return dayjs().format(this.DATE_FORMAT);
  }

  public writeToLogFile(string: string): void {
    const stringWithDate = `${this.getLocalDateString()}: ${string}\n`;
    this.logFileQueue
      .enqueue(() => fs.promises.appendFile('./bot-log.txt', stringWithDate))
      .catch((err) => {
        this.logToConsole(err, 'error');
      });
  }

  public logToConsole(string: string, status?: 'log' | 'debug' | 'error'): void {
    let statusMessageBegin = '';
    let statusMessageEnd = '';
    switch (status) {
      case 'debug':
        statusMessageBegin = chalk.yellow('🐞 ⬇ ⬇ ⬇ Debug info ⬇ ⬇ ⬇ 🐞');
        statusMessageEnd = chalk.yellow('🐞 ⬆ ⬆ ⬆ Debug info ⬆ ⬆ ⬆ 🐞');
        break;
      case 'error':
        statusMessageBegin = chalk.red('🛑 ⬇ ⬇ ⬇ Error info ⬇ ⬇ ⬇ 🛑');
        statusMessageEnd = chalk.red('🛑 ⬆ ⬆ ⬆ Error info ⬆ ⬆ ⬆ 🛑');
        break;
      default:
        console.log(`${chalk.cyan(this.getLocalDateString())}: ${string}`);
        return;
    }
    const finalMessage = `${statusMessageEnd}
${this.getLocalDateString()}
${string}
${statusMessageEnd}`;
    console.log(finalMessage);
  }
}
