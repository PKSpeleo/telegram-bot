module.exports = {
  apps: [
    {
      name: 'telegram_bot',
      script: './telegram_bot.js',
      watch: ['telegram_bot.js', '.env']
    }
  ]
};
