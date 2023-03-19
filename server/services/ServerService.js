const CSStats = require('csstats-reader');
const CSFiles = require('csfiles');
const i18n = require('i18n');

const { serverConfig } = require('../configs');
const { Server } = require('../models');
const MemberService = require('./MemberService');
const { constants } = require('../utils');

const csstats = new CSStats({ path: serverConfig.statsPath });
const csfiles = new CSFiles(serverConfig);
const memberService = new MemberService();

class ServerService {
  async start(bot, chat, from) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_PERMISSION_DENIED));

        return;
      }

      await csfiles.start();
      await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_SERVER_STARTED));
    } catch (error) {
      console.error(error);
    }
  }

  async stop(bot, chat, from) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_PERMISSION_DENIED));

        return;
      }

      await csfiles.stop();
      await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_SERVER_STOPPED));
    } catch (error) {
      console.error(error);
    }
  }

  async address(bot, chat, from, address) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_PERMISSION_DENIED));

        return;
      }

      const server = await Server.findLast();
      await Server.save({ id: server != null ? server.id : null, chat: chat.id, address });
    } catch (error) {
      console.error(error);
    }
  }

  async port(bot, chat, from, port) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_PERMISSION_DENIED));

        return;
      }

      const server = await Server.findLast();
      await Server.save({ id: server != null ? server.id : null, chat: chat.id, port });
    } catch (error) {
      console.error(error);
    }
  }

  async pollMaps(bot, chat, from) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_PERMISSION_DENIED));

        return;
      }

      const maps = await csfiles.randomMaps();

      await bot.sendPoll(chat.id, i18n.__(constants.MESSAGE_MAPS_POLL), maps, {
        allows_multiple_answers: true,
        is_anonymous: false,
        open_period: 3600,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async top(bot, chat) {
    try {
      const top = await csstats.top();
      let message = '';

      message += `<b>${i18n.__(constants.MESSAGE_TOP_10)}:</b>\n`;
      message += top.map((player) => `${player.name} - ${player.kills}/${player.deaths}`).join('\n');

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      console.error(error);
    }
  }

  async info(bot, chat) {
    try {
      const server = await Server.findLast();
      const serverCfg = await csfiles.cfg();
      const mapsCycle = await csfiles.mapsCycle();
      let message = '';

      message = `<b>${i18n.__(constants.MESSAGE_FIRST_MAP)}:</b>\n`;
      message += `${serverCfg.map || 'N/A'}\n`;

      message += `\n<b>${i18n.__(constants.MESSAGE_MAP_CYCLE)}:</b>\n`;
      message += mapsCycle.join('\n');

      message += `\n<b>${i18n.__(constants.MESSAGE_ADDRESS)}:</b>\n`;
      message += `${i18n.__(constants.MESSAGE_ADDRESS)}: ${server != null && server.get('address') != null ? server.get('address') : 'N/A'}\n`;
      message += `${i18n.__(constants.MESSAGE_PORT)}: ${server != null && server.get('port') != null ? server.get('port') : 'N/A'}\n`;

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      console.error(error);
    }
  }

  async maps(bot, chat) {
    try {
      const maps = await csfiles.maps();
      let message = '';

      message = `<b>${i18n.__(constants.MESSAGE_MAPS)}:</b>\n`;
      message += maps.join('\n');

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      console.error(error);
    }
  }

  async updateMaps(pollOptions) {
    try {
      const answers = pollOptions
        .sort((a, b) => ((a.voter_count < b.voter_count) ? 1 : -1))
        .map((answer) => answer.text);

      const firstMap = answers.shift();

      await csfiles.updateMapsCycle(answers);
      await csfiles.updateFirstMap(firstMap);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ServerService;
