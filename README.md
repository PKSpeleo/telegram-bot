# Telegram BOT based on Node.JS and TypeScript for managing Wireguard VPN.

This is Telegram BOT based on Node.JS and TypeScript for managing Wireguard VPN accounts, with automatic deployment based on GitHub Actions. 

It must have a lot of nice features, soon ;)

Work in progress...

## ATTENTION!
Telegram Chat ID can be changed if 
- Changed type of the Group from Private to Public
- Switched on History visibility for new users

Looks like Chat id can be changed only once - from short to long, and then it will stay long without changes.  


By the way!
[Here](https://github.com/PKSpeleo/telegram-bot/blob/master/src/wireguard/wireguardConfigUtils.ts) you can find my Wireguard Config File Parser and Serializer on TypeScrip with tests;)

## What I want to do:
- [x] Support different bots (server_1, server_2, dev) in one repo.
- [x] Automatic deploy to different servers
- [x] Bot must know who is Boss, what chats are supported and who is known user from supported chat
- [ ] Update Documentation to collect all necessary information about how to start this bot (with auto deploy) on fresh VPS.
- [x] Implement logging to Bosses private chat that someone using the Bot. 
- [x] Implement same logging to local file on server (with write queue). 
- [x] Lunch console commands and parse the result by Bot command form Boss
- [x] Implement Wireguard Config File Parser and Serializer
- [x] Explore commands to update Wireguard
- [x] Implement adding new user and rebooting Wireguard
- [x] Generate new user data (config for server and for user)
- [x] Implement whole flow of the user creation with Bot 

### Known problems
- [ ] Figure out with wired behaviour when admin post and call /commands in Channels comments (works fine for users)
- [ ] Need to refactor monster [Wireguard Config File Parser and Serializer](https://github.com/PKSpeleo/telegram-bot/blob/master/src/wireguard/wireguardConfigUtils.ts)
- [ ] Get rid of tests based on real commands and filesystem 

## Preparation.
This BOT supposed to bi started on VPS servers with Ubuntu 20.
Below you will find short instruction how to prepare VPS, what and how need to be installed and how organise your BOT developing process with automatic deploy by GitHub Actions.

### Prepare your machine
Right now these documentations looks like collection of necessary commands for run everything and do not search them aging in documentations. Maybe later it will be better ;)

- Install [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) and reboot
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
Then install Node:
```shell
nvm install 16.14.2
```
- [Generate RSA](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)

- Add aliases and vps config
```shell
nano ~/.ssh/config
```
```
Host *
ForwardAgent yes

Host vps_server
    HostName 1.1.1.1
    User root
    IdentityFile ~/.ssh/vps_rsa
```
Now you can access server by `ssh vps_server`

- Add Wireguard tools to macOS for debugging=)
```shell
brew install wireguard-tools
```

- Add GitHub tools to manage secrets ;)
```shell
brew install gh
```

### Prepare VPS
- Copy PUB Rsa key to the Server
```shell
 scp ~/.ssh/vps_rsa.pub vps_server:~/.ssh/
```
- Add key to the config
```shell
cat ~/.ssh/rsa.pub >> ~/.ssh/authorized_keys
```
- Update apt-get
```shell
apt-get update
```
- Install speedtest
```shell
curl -s https://install.speedtest.net/app/cli/install.deb.sh | bash &&
apt-get install speedtest
```
- Install resources monitor [htop](https://htop.dev/)
```shell
apt install htop
```
- Install network monitor nload
```shell
apt install nload
```
- Install [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) and reboot
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
- Install Node:
```shell
nvm install 16.14.2
```
- Install PROCESS MANAGER FOR NODE.JS [pm2](https://pm2.keymetrics.io/)
```shell
npm install pm2 -g
```
- Install zip fo backups
```shell
apt install zip
```

### Using PM2 for lunching pre-build and bundled node app
- Copy PM2 config file to the server
```shell
scp ecosystem.config.js vps_server:/root/telegram-bot
```
- Copy `telegram_bot.js` and go to the server, lunch the app by PM2 and add to startup:
```shell
pm2 start ecosystem.config.js && \
pm2 startup
```
- Stopping and removing from startup
```shell
pm2 stop ecosystem.config.js && \
pm2 unstartup && \
pm2 delete ecosystem.config.js
```
- Useful commands
```shell
pm2 restart all
pm2 stop all
pm2 start all
pm2 list
pm2 monit
```
