const i18n = require('i18n');

const { Command } = require('../models');

class HelpService {
  async help(bot, chat) {
    try {
      let message = `<b>${i18n.__('Commands')}:</b>\n`;
      const commands = await Command.findAll();

      commands.forEach((command) => {
        message += `${command.get('command')} - ${i18n.__(command.get('description'))}\n`;
      });

      await bot.sendMessage(chat.id, message, { parse_mode: 'html' });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = HelpService;
