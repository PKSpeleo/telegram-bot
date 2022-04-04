import { BotProperties } from '../bot/shared/interfaces';
import dotenv from 'dotenv';
import packageJSONFile from '../../package.json';

dotenv.config();

export function extractEnv(): BotProperties {
  if (process.env.BOT_TOKEN === undefined) {
    throw new Error('Telegram Bot token is missing!');
  }

  const isDebug = (process.env.BOT_DEBUG || '').toLowerCase() === 'true';

  const botProperties: BotProperties = {
    TOKEN: process.env.BOT_TOKEN,
    SERVER_FOR_PING: process.env.BOT_SERVER_FOR_PING || 'google.com',
    ADMIN_ID: Number(process.env.BOT_ADMIN_ID),
    SUPPORTED_CHAT_ID: Number(process.env.BOT_SUPPORTED_CHAT_ID),
    DEBUG: isDebug,
    VERSION: packageJSONFile.version || 'Missing!'
  };

  if (botProperties.DEBUG) {
    console.log('Debug mode enabled! Start command will be logged to the console.');
  }

  return botProperties;
}
