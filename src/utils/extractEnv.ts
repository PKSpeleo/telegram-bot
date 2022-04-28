import { BotProperties } from '../bot/shared/interfaces';
import dotenv from 'dotenv';
import packageJSONFile from '../../package.json';

dotenv.config();

export function extractEnv(): BotProperties {
  const currentBotName = process.env.BOT_CURRENT_NAME;
  if (currentBotName === undefined) {
    throw new Error('Telegram Bot name is missing!');
  }

  const botSettingsName = `BOT_SETTINGS_${currentBotName}`;
  const currentBotSettingsFromEnv = process.env[botSettingsName] || '';
  const currentBotSettingsObj = JSON.parse(currentBotSettingsFromEnv);

  if (currentBotSettingsObj.TOKEN === undefined) {
    throw new Error('Telegram Bot token is missing!');
  }

  const isDebug = (currentBotSettingsObj.DEBUG || '').toLowerCase() === 'true';

  const botProperties: BotProperties = {
    TOKEN: currentBotSettingsObj.TOKEN,
    SERVER_FOR_PING: currentBotSettingsObj.SERVER_FOR_PING || [
      { NAME: 'Google.com', ADDRESS: 'google.com' }
    ],
    ADMIN_ID: convertStringsArrayToNumbersArray(currentBotSettingsObj.ADMIN_ID) || [],
    SUPPORTED_CHAT_ID:
      convertStringsArrayToNumbersArray(currentBotSettingsObj.SUPPORTED_CHAT_ID) || [],
    DEBUG: isDebug,
    SERVER_IP: currentBotSettingsObj.SERVER_IP,
    VERSION: packageJSONFile.version || 'Missing!',
    NAME: currentBotSettingsObj.NAME || ''
  };

  return botProperties;
}

function convertStringsArrayToNumbersArray(array: string[]): number[] {
  return array.map((val) => Number(val));
}
