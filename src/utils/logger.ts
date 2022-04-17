import { PromiseQueue } from './promiseQueue';
import * as fs from 'fs';
import * as readline from 'readline';
import dayjs from 'dayjs';
import chalk from 'chalk';

interface GetLogOutput {
  totalStringsAmount: number;
  requestedStringsAmount: number;
  logStrings: string[];
}

export class Logger {
  private DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss (Z)';
  private LOG_FILE_NAME = './log_bot.txt';
  private logFileQueue = new PromiseQueue();

  private getLocalDateString(): string {
    return dayjs().format(this.DATE_FORMAT);
  }

  public async getLastLogStrings(stringsQuantity = 10): Promise<GetLogOutput> {
    return new Promise((resolve, reject) => {
      const lastLogStrings: string[] = [];
      let totalStringsAmount = 0;
      const rl = readline.createInterface({
        input: fs.createReadStream(this.LOG_FILE_NAME),
        crlfDelay: Infinity
      });
      rl.on('line', (line) => {
        lastLogStrings.push(line);
        totalStringsAmount++;
        if (lastLogStrings.length > stringsQuantity) {
          lastLogStrings.shift();
        }
      });
      rl.on('close', () => {
        resolve({
          totalStringsAmount: totalStringsAmount,
          requestedStringsAmount: stringsQuantity,
          logStrings: lastLogStrings
        });
      });
      rl.on('error', (err) => {
        reject(err);
      });
    });
  }

  public writeToLogFile(string: string): void {
    const stringWithDate = `${this.getLocalDateString()}: ${string}\n`;
    this.logFileQueue
      .enqueue(() => fs.promises.appendFile(this.LOG_FILE_NAME, stringWithDate))
      .catch((err) => {
        this.logToConsole(err, 'error');
      });
  }

  public logToConsole(string: string, status?: 'log' | 'debug' | 'error'): void {
    let statusMessageBegin = '';
    let statusMessageEnd = '';
    switch (status) {
      case 'debug':
        statusMessageBegin = chalk.yellow('🪲 --- Debug info --- 🪲');
        statusMessageEnd = chalk.yellow('🪲 --- Debug info --- 🪲');
        break;
      case 'error':
        statusMessageBegin = chalk.red('🛑 --- Error info --- 🛑');
        statusMessageEnd = chalk.red('🛑 --- Error info --- 🛑');
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
