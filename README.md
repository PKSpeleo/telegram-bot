# Telegram BOT based on Node.JS and TypeScript for managing Wireguard VPN.

This is Telegram BOT based on Node.JS and TypeScript for managing Wireguard VPN accounts, with automatic deployment based on GitHub Actions. 

It must have a lot of nice features, soon ;)

Work in progress...

## What I want to do:
- [x] Support different bots (server_1, server_2, dev) in one repo.
- [x] Automatic deploy to different servers
- [x] But must know who is Boss, what chats are supported and who is known user from supported chat
- [ ] Update Documentation to collect all necessary information about how to start this bot (with auto deploy) on fresh VPS.
- [ ] Implement logging to Bosses private chat that someone using the Bot. 
- [ ] Implement same logging to local file on server (with write queue). 
- [ ] Lunch console commands and parse the result by Bot command form Boss
- [ ] Implement Wireguard config file reading and writing (add fake user)
- [ ] Explore commands to update Wireguard
- [ ] Generate new user data (config for server and for user)
- [ ] Implement whole flow of the user creation with Bot 

### Known problems
- [ ] Figure out with wired behaviour when admin post and call /commands in Channels comments (works fine for users)

## Installation
This BOT supposed to bi started on VPS servers with Ubuntu 20.
Below you will find short instruction how to prepare VPS, what and how need to be installed and how organise your BOT developing process with automatic deploy by GitHub Actions.

