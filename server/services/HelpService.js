const i18n = require('i18n');

const { Command } = require('../models');
const logger = require('../../logger');
const constants = require('../utils/constants');

class HelpService {
  async help(bot, chat) {
    try {
      let message = `<b>${i18n.__(constants.COMMANDS)}:\n</b>`;
      const commands = await Command.findAll();

      commands.forEach((command) => {
        message += `${command.get('command')} - ${i18n.__(command.get('description'))}\n`;
      });

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = HelpService;
