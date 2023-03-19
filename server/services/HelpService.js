const i18n = require('i18n');

const { Command } = require('../models');
const { constants } = require('../utils');

class HelpService {
  async help(bot, chat) {
    try {
      const commands = await Command.findAll();
      let message = '';

      message = `<b>${i18n.__(constants.MESSAGE_COMMANDS)}:\n</b>`;
      message += commands.map((command) => `${command.get('command')} - ${i18n.__(command.get('description'))}`).join('\n');

      await bot.sendMessage(chat.id, message, { parse_mode: constants.PARSE_MODE });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = HelpService;
