const CSStats = require('csstats-reader');
const CSFiles = require('csfiles');
const i18n = require('i18n');

const { serverConfig } = require('../configs');
const { Server } = require('../models');
const MemberService = require('./MemberService');
const logger = require('../../logger');
const constants = require('../utils/constants');

const csstats = new CSStats({ path: serverConfig.statsPath });
const csfiles = new CSFiles(serverConfig);
const memberService = new MemberService();

class ServerService {
  async start(bot, chat, from) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      await csfiles.start();
      await bot.sendMessage(chat.id, i18n.__(constants.SERVER_STARTED));
    } catch (error) {
      logger.error(error);
    }
  }

  async stop(bot, chat, from) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      await csfiles.stop();
      await bot.sendMessage(chat.id, i18n.__(constants.SERVER_STOPPED));
    } catch (error) {
      logger.error(error);
    }
  }

  async address(bot, chat, from, address) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
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
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
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
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      const maps = await csfiles.randomMaps();

      await bot.sendPoll(chat.id, i18n.__(constants.MAPS_POLL), maps, {
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
      const top = await csstats.top();
      let message = `<b>${i18n.__(constants.TOP_10)}:</b>\n`;

      top.forEach((player) => {
        message += `${player.name} - ${player.kills}/${player.deaths}\n`;
      });

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      logger.error(error);
    }
  }

  async info(bot, chat) {
    try {
      const server = await Server.findLast();
      const serverCfg = await csfiles.cfg();
      const mapsCycle = await csfiles.mapsCycle();

      let message = `<b>${i18n.__(constants.FIRST_MAP)}:</b>\n`;
      message += `${serverCfg.map || 'N/A'}\n\n`;

      message += `<b>${i18n.__(constants.MAP_CYCLE)}:</b>\n`;
      mapsCycle.forEach((map) => {
        message += `${map}\n`;
      });

      message += `<b>${i18n.__(constants.ADDRESS)}:</b>\n`;
      message += `${i18n.__(constants.ADDRESS)}: ${server != null && server.get('address') != null ? server.get('address') : 'N/A'}\n`;
      message += `${i18n.__(constants.PORT)}: ${server != null && server.get('port') != null ? server.get('port') : 'N/A'}\n`;

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      logger.error(error);
    }
  }

  async maps(bot, chat) {
    try {
      const maps = await csfiles.maps();
      let message = `<b>${i18n.__(constants.MAPS)}:</b>\n`;

      maps.forEach((map) => {
        message += `${map}\n`;
      });

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      logger.error(error);
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
      logger.error(error);
    }
  }
}

module.exports = ServerService;
