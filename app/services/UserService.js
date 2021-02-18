const fs = require('fs');
const path = require('path');
const csstats = require('csstats');

const { serverConfig } = require('../configs');

class UserService {
  
  async top(bot, chatId) {
    try {
      csstats.parse(serverConfig.stats, function (players) {
        players = players.sort((a, b) => (a.kills < b.kills) ? 1 : -1);

        let message = `TOP 10 ☠: \n\n`;
        const length = players.length >= 10 ? 9 : players.length;

        players.slice(0, length).forEach((player) => {
          message += `${player.name} - ${player.kills}/${player.deaths}\n`;
        });

        bot.sendMessage(chatId, message);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async motd(bot, chatId) {
    try {
      let message = `Maps 🗺: \n\n`;

      const mapCycle = fs.readFileSync(serverConfig.mapCycle).toString().split("\n");
      const serverCfg = fs.readFileSync(serverConfig.cfg).toString().split("\n");

      const serverCfgJson = {};

      serverCfg.forEach((line) => {
        if(!line.startsWith('//') && !line.trim() == "") {
          const currentline = line.split(' ');
          serverCfgJson[currentline[0].trim().replace(/["]/g, "")] = currentline[1].trim().replace(/["]/g, "");
        }
      });

      message += `${serverCfgJson.map} - First Map\n`;

      mapCycle.forEach((map) => {
        message += `${map}\n`;
      });

      message += `\nServer 🖥: \n\n`
      message += `Address: ${serverConfig.ip}\n`;
      message += `Port: ${serverConfig.port}\n`;

      bot.sendMessage(chatId, message);
    } catch (error) {
      console.error(error);
    }
  }

  async maps(bot, chatId) {
    try {
      fs.readdir(serverConfig.mapsPath, function (err, files) {
        if (err) {
          bot.sendMessage(chatId, `Path not found 😭`);
          return;
        } 

        let message = `Maps 🗺: \n\n`;

        files = files.filter(function(file) {
          return path.extname(file).toLowerCase() === '.bsp' && (serverConfig.mapsFilter != null ? file.includes(serverConfig.mapsFilter) : true);
        });

        files.forEach(function (file) {
          message += `${file.replace('.bsp', '')}\n`;
        });

        bot.sendMessage(chatId, message);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async help(bot, chatId) {
    try {
      bot.sendMessage(chatId, `Commands:\n\n/server start - Start server\n/server stop - Stop server\n/top - Top 10 players\n/motd - Today info\n/maps - List maps\n/poll maps - Maps poll\n/cron start [expression] - Cron Job for auto start\n/cron stop [expression] - Cron Job for auto stop\n/cron poll [expression] - Cron Job for auto poll\n\n/help - Commands`);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = UserService;
