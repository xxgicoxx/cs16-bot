const schedule = require('node-schedule');
const i18n = require('i18n');

const { CronTab } = require('../models');
const ServerService = require('./ServerService');
const MemberService = require('./MemberService');
const { constants } = require('../utils');

const serverService = new ServerService();
const memberService = new MemberService();

class CronTabService {
  async job(bot, chat, from, type, expression) {
    try {
      if (!await memberService.isAdminOrCreator(bot, chat, from)) {
        await bot.sendMessage(chat.id, i18n.__(constants.MESSAGE_PERMISSION_DENIED));

        return;
      }

      const scheduledJob = schedule.scheduledJobs[`${type}`];
      const job = await CronTab.findByType(type);
      const id = job != null ? job.id : null;

      await CronTab.save({
        id,
        member: from.id,
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
      console.error(error);
    }
  }

  async jobs(bot) {
    try {
      const jobs = await CronTab.findAll();

      jobs.forEach((job) => this.job(bot, { id: job.get('chat') }, { id: job.get('member'), bot: true }, job.get('type'), job.get('expression')));
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = CronTabService;
