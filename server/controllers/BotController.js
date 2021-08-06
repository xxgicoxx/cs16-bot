const { telegramConfig } = require('../configs');
const {
  HelpService,
  CronTabService,
  ServerService,
  UserService,
} = require('../services');

const helpService = new HelpService();
const cronTabService = new CronTabService();
const userService = new UserService();
const serverService = new ServerService();

class BotController {
  constructor(bot) {
    this.bot = bot;
  }

  async handle() {
    try {
      this.bot.on('message', ($) => {
        const command = $.text ? $.text.replace(telegramConfig.username, '') : $.text;

        switch (command) {
          case '/help':
            helpService.help(this.bot, $.chat);
            break;
          default:
            break;
        }
      });

      this.bot.onText(/\/user (.+)/, ($, match) => {
        const params = match[1].split(' ');
        const command = params[0];

        if (command === 'register') {
          userService.register(this.bot, $.chat, $.from);
        } else if (command === 'delete') {
          userService.del(this.bot, $.chat, $.from);
        } else if (command === 'admin') {
          const username = params[1];
          const admin = params[2];

          userService.admin(this.bot, $.chat, $.from, username, admin);
        }
      });

      this.bot.onText(/\/server (.+)/, ($, match) => {
        const command = match[1];

        if (command === 'start') {
          serverService.start(this.bot, $.chat, $.from);
        } else if (command === 'stop') {
          serverService.stop(this.bot, $.chat, $.from);
        } else if (command === 'top') {
          serverService.top(this.bot, $.chat);
        } else if (command === 'maps') {
          serverService.maps(this.bot, $.chat);
        } else if (command === 'info') {
          serverService.info(this.bot, $.chat);
        } else if (command.includes('address')) {
          const address = command.replace('address', '').trim();
          serverService.address(this.bot, $.chat, $.from, address);
        } else if (command.includes('port')) {
          const port = command.replace('port', '').trim();
          serverService.port(this.bot, $.chat, $.from, port);
        }
      });

      this.bot.onText(/\/poll (.+)/, ($, match) => {
        const command = match[1];

        if (command === 'maps') {
          serverService.pollMaps(this.bot, $.chat, $.from);
        }
      });

      this.bot.onText(/\/cron (.+)/, ($, match) => {
        const command = match[1];
        const params = command.trim().split(' ');
        const type = params[0];
        const expression = command.replace(type, '').trim();

        cronTabService.job(this.bot, $.chat, $.from, type, expression);
      });

      this.bot.on('poll', (poll) => {
        serverService.updateMaps(poll.options);
      });

      this.bot.on('polling_error', console.error);
    } catch (error) {
      console.error(error);
    }
  }

  async jobs() {
    try {
      cronTabService.jobs(this.bot);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = BotController;
