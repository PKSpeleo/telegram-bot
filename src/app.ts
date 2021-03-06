import { startBot } from './bot/bot';
import { extractEnv } from './utils/extractEnv';
import { Logger } from './utils/logger';
import chalk from 'chalk';
import { WireguardBotAdapter } from './wireguard/wireguardBotAdapter';

const logger = new Logger();
export const wg = new WireguardBotAdapter();
const botProperties = extractEnv();

logger.logToConsole(`🤖️ Starting version ${botProperties.VERSION} ${botProperties.NAME}`);
logger.writeToLogFile(`🤖 Starting version ${botProperties.VERSION} ${botProperties.NAME}`);

logger.logToConsole(
  `BOT Name: ${botProperties.NAME}
BOT Token: ${botProperties.TOKEN}
DNS Servers: ${botProperties.DNS_SERVERS}
Admins ID: ${botProperties.ADMIN_ID}
Supported chat ID: ${botProperties.SUPPORTED_CHAT_ID}
Server IP Address: ${botProperties.SERVER_IP}
Debug mode: ${chalk.yellow(botProperties.DEBUG)}
Version: ${botProperties.VERSION}`,
  'debug'
);

startBot(botProperties, logger)
  .then(() => {
    logger.logToConsole('🤖 ✅ Bot started successfully!');
    logger.writeToLogFile('🤖 ✅ Bot started successfully!');
  })
  .catch((err) => {
    logger.logToConsole(`🤖 🛑 Wow! Bot crashed during start: ${err}`, 'error');
    logger.writeToLogFile(`🤖 🛑 Wow! Bot crashed during start: ${err}`);
  });
