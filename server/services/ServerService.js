const fs = require('fs');
const path = require('path');
const taskkill = require('taskkill');
const { exec } = require('child_process');
const csstats = require('csstats');
const i18n = require('i18n');

const { serverConfig } = require('../configs');
const { Command, Server, User } = require('../models');

class ServerService {
  async start(bot, chat, from) {
    try {
      if (from.bot || await User.isAdmin(from.id)) {
        this.isRunning('hlds.exe', async (status) => {
          if (!status) {
            exec(serverConfig.hldsExe);
          }

          await bot.sendMessage(chat.id, i18n.__('Server started'));
        });
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async stop(bot, chat, from) {
    try {
      if (from.bot || await User.isAdmin(from.id)) {
        await taskkill(['hlds.exe']);

        await bot.sendMessage(chat.id, i18n.__('Server stopped'));
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async address(bot, chat, from, address) {
    try {
      if (await User.isAdmin(from.id)) {
        const server = await Server.findLast();
        await Server.save({ id: server != null ? server.id : null, chat: chat.id, address });
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async port(bot, chat, from, port) {
    try {
      if (await User.isAdmin(from.id)) {
        const server = await Server.findLast();
        await Server.save({ id: server != null ? server.id : null, chat: chat.id, port });
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async pollMaps(bot, chat, from) {
    try {
      if (from.bot || await User.isAdmin(from.id)) {
        const mapsExists = fs.existsSync(serverConfig.mapsPath);

        if (mapsExists) {
          let files = fs.readdirSync(serverConfig.mapsPath);
          let maps = [];

          files = files.filter((file) => path.extname(file).toLowerCase() === '.bsp' && (serverConfig.mapsFilter != null ? file.includes(serverConfig.mapsFilter) : true));

          files.forEach((file) => {
            maps.push(file.replace('.bsp', ''));
          });

          maps = maps.map((a) => ({
            sort: Math.random(), value: a,
          })).sort((a, b) => a.sort - b.sort).map((a) => a.value);

          await bot.sendPoll(chat.id, i18n.__('Maps poll'), maps.slice(0, 10), {
            allows_multiple_answers: true,
            is_anonymous: false,
            open_period: 3600,
          });
        } else {
          await bot.sendMessage(chat.id, i18n.__('Path not found'));
        }
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
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
      console.error(error);
    }
  }

  isRunning(query, cb) {
    const { platform } = process;
    let cmd = '';

    switch (platform) {
      case 'win32':
        cmd = 'tasklist';
        break;
      case 'darwin':
        cmd = `ps -ax | grep ${query}`;
        break;
      case 'linux':
        cmd = 'ps -A';
        break;
      default:
        break;
    }

    exec(cmd, (error, stdout) => {
      cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
  }
}

module.exports = ServerService;
