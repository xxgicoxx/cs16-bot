const fs = require('fs');
const path = require('path');
const csstats = require('csstats');
const i18n = require('i18n');

const { serverConfig } = require('../configs');
const { Command, Server, User } = require('../models');

class UserService {
  async admin(bot, chat, from, username, admin) {
    try {
      if (await User.isAdmin(from.id)) {
        const user = await User.findByUsername(username);

        if (user != null) {
          if (user.get('creator')) {
            await bot.sendMessage(chat.id, i18n.__('Permission denied'));
          } else {
            await User.save({ id: user.id, admin: admin === 'true' });
            await bot.sendMessage(chat.id, i18n.__('User {{username}} updated', { username }));
          }
        } else {
          await bot.sendMessage(chat.id, i18n.__('User {{username}} not found', { username }));
        }
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async register(bot, chat, from) {
    try {
      const user = await User.findByUser(from.id);
      await User.save({
        id: user != null ? user.id : null,
        user: from.id,
        chat: chat.id,
        username: from.username,
        admin: user != null ? user.get('admin') : null,
      });

      await bot.sendMessage(chat.id, i18n.__('User {{username}} registred or updated', { username: from.username }));
    } catch (error) {
      console.error(error);
    }
  }

  async del(bot, chat, from) {
    try {
      const user = await User.findByUser(from.id);

      if (user.get('creator')) {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      } else {
        await User.destroy({ id: user != null ? user.id : null });
        await bot.sendMessage(chat.id, i18n.__('User {{username}} deleted', { username: from.username }));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async top(bot, chat) {
    try {
      const serverStatsExists = fs.existsSync(serverConfig.stats);

      if (serverStatsExists) {
        csstats.parse(serverConfig.stats, async (stats) => {
          let message = `<b>${i18n.__('Top 10')}:</b>\n`;

          const players = stats.sort((a, b) => ((a.kills < b.kills) ? 1 : -1));
          const length = players.length >= 10 ? 9 : players.length;

          players.slice(0, length).forEach((player) => {
            message += `${player.name} - ${player.kills}/${player.deaths}\n`;
          });

          await bot.sendMessage(chat.id, message, { parse_mode: 'html' });
        });
      } else {
        await bot.sendMessage(chat.id, i18n.__('Path not found'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async info(bot, chat) {
    try {
      let message = `<b>${i18n.__('First Map')}:</b>\n`;

      const serverCfgExists = fs.existsSync(serverConfig.cfg);
      const mapCycleExists = fs.existsSync(serverConfig.mapCycle);
      const server = await Server.findLast();

      if (serverCfgExists) {
        const serverCfg = fs.readFileSync(serverConfig.cfg).toString().split('\n');
        const serverCfgJson = {};

        serverCfg.forEach((line) => {
          if (!line.startsWith('//') && line.trim() !== '') {
            const currentline = line.split(' ');
            serverCfgJson[currentline[0].trim().replace(/["]/g, '')] = currentline[1].trim().replace(/["]/g, '');
          }
        });

        message += `${serverCfgJson.map}\n\n`;
      } else {
        message += `${i18n.__('Path not found')}\n\n`;
      }

      message += `<b>${i18n.__('Map Cycle')}:</b>\n`;
      if (mapCycleExists) {
        const mapCycle = fs.readFileSync(serverConfig.mapCycle).toString().split('\n');

        mapCycle.forEach((map) => {
          message += `${map}\n`;
        });
      } else {
        message += `${i18n.__('Path not found')}\n\n`;
      }

      message += `<b>${i18n.__('Server')}:</b>\n`;
      if (server != null && (server.get('address') != null || server.get('port') != null)) {
        message += `${i18n.__('Address')}: ${server.get('address') != null ? server.get('address') : 'N/A'}\n`;
        message += `${i18n.__('Port')}: ${server.get('port') != null ? server.get('port') : 'N/A'}\n`;
      } else {
        message += i18n.__('Not configured');
      }

      await bot.sendMessage(chat.id, message, { parse_mode: 'html' });
    } catch (error) {
      console.error(error);
    }
  }

  async maps(bot, chat) {
    try {
      const mapsPathExists = fs.existsSync(serverConfig.mapsPath);

      if (mapsPathExists) {
        let message = `<b>${i18n.__('Maps')}:</b>\n`;
        let files = fs.readdirSync(serverConfig.mapsPath);

        files = files.filter((file) => path.extname(file).toLowerCase() === '.bsp' && (serverConfig.mapsFilter != null ? file.includes(serverConfig.mapsFilter) : true));

        files.forEach((file) => {
          message += `${file.replace('.bsp', '')}\n`;
        });

        await bot.sendMessage(chat.id, message, { parse_mode: 'html' });
      } else {
        await bot.sendMessage(chat.id, i18n.__('Path not found'));
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = UserService;
