const { telegramConfig } = require('../configs');
const {
  HelpService,
  CronTabService,
  ServerService,
} = require('../services');
const logger = require('../../logger');
const constants = require('../utils/constants');

const helpService = new HelpService();
const cronTabService = new CronTabService();
const serverService = new ServerService();

class BotController {
  constructor(bot) {
    this.bot = bot;
  }

  async handle() {
    try {
      this.bot.on(constants.ON_MESSAGE, ($) => {
        const command = $.text ? $.text.replace(telegramConfig.username, '') : $.text;

        switch (command) {
          case constants.COMMNAD_HELP:
            helpService.help(this.bot, $.chat);
            break;
          default:
            break;
        }
      });

      this.bot.onText(constants.COMMAND_SERVER, ($, match) => {
        const command = match[1];

        if (command === constants.COMMAND_SERVER_START) {
          serverService.start(this.bot, $.chat, $.from);
        } else if (command === constants.COMMAND_SERVER_STOP) {
          serverService.stop(this.bot, $.chat, $.from);
        } else if (command === constants.COMMAND_SERVER_TOP) {
          serverService.top(this.bot, $.chat);
        } else if (command === constants.COMMAND_SERVER_MAPS) {
          serverService.maps(this.bot, $.chat);
        } else if (command === constants.COMMAND_SERVER_INFO) {
          serverService.info(this.bot, $.chat);
        } else if (command.includes(constants.COMMAND_SERVER_ADDRESS)) {
          const address = command.replace(constants.COMMAND_SERVER_ADDRESS, '').trim();
          serverService.address(this.bot, $.chat, $.from, address);
        } else if (command.includes(constants.COMMAND_SERVER_PORT)) {
          const port = command.replace(constants.COMMAND_SERVER_PORT, '').trim();
          serverService.port(this.bot, $.chat, $.from, port);
        }
      });

      this.bot.onText(constants.COMMAND_POLL, ($, match) => {
        const command = match[1];

        if (command === constants.COMMAND_POLL_MAPS) {
          serverService.pollMaps(this.bot, $.chat, $.from);
        }
      });

      this.bot.onText(constants.COMMAND_CRON, ($, match) => {
        const command = match[1];
        const params = command.trim().split(' ');
        const type = params[0];
        const expression = command.replace(type, '').trim();

        cronTabService.job(this.bot, $.chat, $.from, type, expression);
      });

      this.bot.on(constants.ON_POLL, (poll) => serverService.updateMaps(poll.options));
      this.bot.on(constants.ON_POLLING_ERROR, console.error);
    } catch (error) {
      logger.error(error);
    }
  }

  async jobs() {
    try {
      cronTabService.jobs(this.bot);
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = BotController;
