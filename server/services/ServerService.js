const fs = require('fs');
const path = require('path');
const taskkill = require('taskkill');
const { exec } = require('child_process');
const csstats = require('csstats');
const i18n = require('i18n');

const { serverConfig } = require('../configs');
const { Server, User } = require('../models');
const logger = require('../../logger');
const constants = require('../utils/constants');

class ServerService {
  async start(bot, chat, from) {
    try {
      if (!(from.bot || await User.isAdmin(from.id))) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      const running = await this.isRunning(constants.EXECUTABLE);

      if (!running) {
        exec(serverConfig.hldsExe);
      }

      await bot.sendMessage(chat.id, i18n.__(constants.SERVER_STARTED));
    } catch (error) {
      logger.error(error);
    }
  }

  async stop(bot, chat, from) {
    try {
      if (!(from.bot || await User.isAdmin(from.id))) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      await taskkill([constants.EXECUTABLE]);
      await bot.sendMessage(chat.id, i18n.__(constants.SERVER_STOPPED));
    } catch (error) {
      logger.error(error);
    }
  }

  async address(bot, chat, from, address) {
    try {
      if (!await User.isAdmin(from.id)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      const server = await Server.findLast();
      await Server.save({ id: server != null ? server.id : null, chat: chat.id, address });
    } catch (error) {
      logger.error(error);
    }
  }

  async port(bot, chat, from, port) {
    try {
      if (!await User.isAdmin(from.id)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      const server = await Server.findLast();
      await Server.save({ id: server != null ? server.id : null, chat: chat.id, port });
    } catch (error) {
      logger.error(error);
    }
  }

  async pollMaps(bot, chat, from) {
    try {
      if (!(from.bot || await User.isAdmin(from.id))) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      const mapsExists = fs.existsSync(serverConfig.mapsPath);

      if (!mapsExists) {
        await bot.sendMessage(chat.id, i18n.__(constants.PATH_NOT_FOUND));
        return;
      }

      const files = this.readDirWithFilter(serverConfig.mapsPath);
      let maps = [];

      files.forEach((file) => {
        maps.push(file.replace(constants.MAPS_EXTENSION, ''));
      });

      maps = maps.map((a) => ({
        sort: Math.random(),
        value: a,
      })).sort((a, b) => a.sort - b.sort).map((a) => a.value);

      await bot.sendPoll(chat.id, i18n.__(constants.MAPS_POLL), maps.slice(0, 10), {
        allows_multiple_answers: true,
        is_anonymous: false,
        open_period: 3600,
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async top(bot, chat) {
    try {
      const serverStatsExists = fs.existsSync(serverConfig.stats);

      if (!serverStatsExists) {
        await bot.sendMessage(chat.id, i18n.__(constants.PATH_NOT_FOUND));
        return;
      }

      csstats.parse(serverConfig.stats, async (stats) => {
        let message = `<b>${i18n.__(constants.TOP_10)}:</b>\n`;

        const players = stats.sort((a, b) => ((a.kills < b.kills) ? 1 : -1));
        const length = players.length >= 10 ? 9 : players.length;

        players.slice(0, length).forEach((player) => {
          message += `${player.name} - ${player.kills}/${player.deaths}\n`;
        });

        await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async info(bot, chat) {
    try {
      let message = `<b>${i18n.__(constants.FIRST_MAP)}:</b>\n`;

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
        message += `${i18n.__(constants.PATH_NOT_FOUND)}\n\n`;
      }

      message += `<b>${i18n.__(constants.MAP_CYCLE)}:</b>\n`;
      if (mapCycleExists) {
        const mapCycle = fs.readFileSync(serverConfig.mapCycle).toString().split('\n');

        mapCycle.forEach((map) => {
          message += `${map}\n`;
        });
      } else {
        message += `${i18n.__(constants.PATH_NOT_FOUND)}\n\n`;
      }

      message += `<b>${i18n.__(constants.ADDRESS)}:</b>\n`;
      if (server != null && (server.get('address') != null || server.get('port') != null)) {
        message += `${i18n.__(constants.ADDRESS)}: ${server.get('address') != null ? server.get('address') : 'N/A'}\n`;
        message += `${i18n.__(constants.PORT)}: ${server.get('port') != null ? server.get('port') : 'N/A'}\n`;
      } else {
        message += i18n.__(constants.NOT_CONFIGURED);
      }

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      logger.error(error);
    }
  }

  async maps(bot, chat) {
    try {
      const mapsPathExists = fs.existsSync(serverConfig.mapsPath);

      if (!mapsPathExists) {
        await bot.sendMessage(chat.id, i18n.__(constants.PATH_NOT_FOUND));
        return;
      }

      const files = this.readDirWithFilter(serverConfig.mapsPath);
      let message = `<b>${i18n.__(constants.MAPS)}:</b>\n`;

      files.forEach((file) => {
        message += `${file.replace(constants.MAPS_EXTENSION, '')}\n`;
      });

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      logger.error(error);
    }
  }

  async updateMaps(pollOptions) {
    try {
      let firstMap = '';

      const answers = pollOptions.sort((a, b) => ((a.voter_count < b.voter_count) ? 1 : -1));
      const mapCycleStream = fs.createWriteStream(`${serverConfig.mapCycle}`, { flags: 'w' });

      answers.forEach((option, index) => {
        if (index === 0) {
          firstMap = option.text;
        } else {
          mapCycleStream.write(`${option.text}\n`);
        }
      });

      mapCycleStream.end();

      const serverCfg = fs.readFileSync(serverConfig.cfg).toString().split('\n');
      const newServerCfg = [];

      serverCfg.forEach((line) => {
        if (line.startsWith('map ')) {
          newServerCfg.push(`map ${firstMap}`);
        } else {
          newServerCfg.push(line);
        }
      });

      const serverCfgStream = fs.createWriteStream(`${serverConfig.cfg}`, { flags: 'w' });

      newServerCfg.forEach((line) => {
        serverCfgStream.write(`${line}\n`);
      });

      serverCfgStream.end();
    } catch (error) {
      logger.error(error);
    }
  }

  async isRunning(executable) {
    return new Promise((resolve) => {
      const cmd = 'tasklist';

      if (cmd === '' || executable === '') {
        resolve(false);
      }

      exec(cmd, (err, stdout) => {
        resolve(stdout.toLowerCase().indexOf(executable.toLowerCase()) > -1);
      });
    });
  }

  readDirWithFilter(dirPath) {
    const filter = serverConfig.mapsFilter;
    const files = fs.readdirSync(dirPath);

    return files.filter((file) => {
      const extension = path.extname(file).toLowerCase();
      const includesFilter = filter != null ? file.includes(filter) : true;

      return extension === constants.MAPS_EXTENSION && includesFilter;
    });
  }
}

module.exports = ServerService;
