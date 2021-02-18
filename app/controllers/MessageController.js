const { telegramConfig } = require('../configs');
const { AdminService, UserService } = require('../services');

const userService = new UserService();
const adminService = new AdminService();

class MessageController {
  
  constructor(bot) {
    this.bot = bot;
  }

  async handle() {
    this.bot.on('message', ($) => {
      $.text = $.text ? $.text.replace(telegramConfig.user, "") : $.text;

      switch ($.text) {
        case "/top":
          userService.top(this.bot, $.chat.id);
          break;
        case "/motd":
          userService.motd(this.bot, $.chat.id);
          break;
        case "/maps":
          userService.maps(this.bot, $.chat.id);
          break;
        case "/help":
          userService.help(this.bot, $.chat.id);
          break;
        default:
          break;
      }
    }); 

    this.bot.onText(/\/server (.+)/, ($, match) => {
      const command = match[1];

      if(command === 'start') {
        adminService.start(this.bot, $.chat.id, $.from.id);
      } else if (command === 'stop') {
        adminService.stop(this.bot, $.chat.id, $.from.id);
      }
    });

    this.bot.onText(/\/poll (.+)/, ($, match) => {
      const command = match[1];

      if(command === 'maps') {
        adminService.pollMaps(this.bot, $.chat.id, $.from.id);
      }
    });

    this.bot.onText(/\/cron (.+)/, ($, match) => {
      const commands = match[1];
      const type = commands.split(" ")[0];
      const expression = commands.replace(`${type} `, "").replace(`${type}`, "");

      adminService.cron(this.bot, $.chat.id, $.from.id, type, expression);
    });

    this.bot.on('poll', (poll) => {
      adminService.updateMaps(poll.options);
    });

    this.bot.on("polling_error", console.log);
  }

  async cron() {
    adminService.jobs(this.bot);
  }
}

module.exports = MessageController;
