const schedule = require('node-schedule');
const i18n = require('i18n');

const { CronTab, User } = require('../models');
const ServerService = require('./ServerService');
const logger = require('../../logger');
const constants = require('../utils/constants');

const serverService = new ServerService();

class CronTabService {
  async job(bot, chat, from, type, expression) {
    try {
      if (!(from.bot || await User.isAdmin(from.id))) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      const scheduledJob = schedule.scheduledJobs[`${type}`];
      const job = await CronTab.findByType(type);
      const id = job != null ? job.id : null;

      await CronTab.save({
        id,
        user: from.id,
        chat: chat.id,
        type,
        expression,
      });

      if (scheduledJob != null) {
        scheduledJob.cancel();
      }

      if (expression != null && expression.trim() !== '') {
        schedule.scheduleJob(`${type}`, expression, () => {
          switch (type) {
            case constants.CRON_TYPE_START:
              serverService.start(bot, chat, from);
              break;
            case constants.CRON_TYPE_STOP:
              serverService.stop(bot, chat, from);
              break;
            case constants.CRON_TYPE_POLLMAPS:
              serverService.pollMaps(bot, chat, from);
              break;
            default:
              break;
          }
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }

  async jobs(bot) {
    try {
      const jobs = await CronTab.findAll();

      jobs.forEach((job) => this.job(bot, { id: job.get('chat') }, { id: job.get('user'), bot: true }, job.get('type'), job.get('expression')));
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = CronTabService;
