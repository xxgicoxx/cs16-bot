const schedule = require('node-schedule');
const i18n = require('i18n');

const { CronTab, User } = require('../models');

class CronTabService {
  async job(bot, chat, from, type, expression) {
    try {
      if (from.bot || await User.isAdmin(from.id)) {
        const scheduledJob = schedule.scheduledJobs[`${type}`];
        const job = await CronTab.findByType(type);

        await CronTab.save({
          id: job != null ? job.id : null,
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
              case 'start':
                this.start(bot, chat.id, from);
                break;
              case 'stop':
                this.stop(bot, chat.id, from);
                break;
              case 'pollmaps':
                this.pollMaps(bot, chat.id, from);
                break;
              default:
                break;
            }
          });
        }
      } else {
        await bot.sendMessage(chat.id, i18n.__('Permission denied'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async jobs(bot) {
    try {
      const jobs = await CronTab.findAll();

      jobs.forEach((job) => {
        this.job(bot, { id: job.get('chat') }, { id: job.get('user'), bot: true }, job.get('type'), job.get('expression'));
      });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = CronTabService;
