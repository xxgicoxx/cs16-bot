# CSBOT
Telegram bot for Counter-Strike 1.6 Server.

![Bot](https://i.imgur.com/Xpi62zd.png)

### Features
* /server start - Start server
* /server stop - Stop server
* /top - Top 10 players
* /motd - Today info
* /maps - List maps
* /poll maps - Maps poll
* /cron start [expression] - Cron Job for auto start
* /cron stop [expression] - Cron Job for auto stop
* /cron poll [expression] - Cron Job for auto poll
* /help - Commands

### Prerequisites
* [Node.js](https://nodejs.org/en/) - Node.js

### Running
The server can be run locally and also deployed to your own server.

### Telegram
````
# Create an Telegram bot
Find @BotFather on Telegram, type /newbot and follow the instructions

# Configure
Get your token from @BotFather and set in '.env' file
````

### Configure
````
# Bot
Configure bot in '.env' file

# HLDS
Set the '-console -game cstrike' parameters in the hlds.exe path to open as a console
````

### Run
````
# Install dependencies
npm install

# Start
npm start
````

### Built With
* [Node.js](https://nodejs.org/en/)

### Authors
* **Giovani de Oliveira** - [xxgicoxx](https://github.com/xxgicoxx)