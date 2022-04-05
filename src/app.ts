import { startBot } from './bot/bot';
import { extractEnv } from './utils/extractEnv';

const botProperties = extractEnv();

console.log('BOT Name', botProperties.NAME);
console.log('BOT Token', botProperties.TOKEN);
console.log('Server for ping: ', botProperties.SERVER_FOR_PING);
console.log('Admins ID: ', botProperties.ADMIN_ID);
console.log('Supported chat ID: ', botProperties.SUPPORTED_CHAT_ID);
console.log('Version: ', botProperties.VERSION);

startBot(botProperties)
  .then(() => {
    console.log('Bot started successfully!');
  })
  .catch((err) => {
    console.error('Wow! Bot crashed during start: ', err);
  });
