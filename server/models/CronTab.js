const { dbConfig } = require('../configs');
const bookshelf = require('bookshelf')(dbConfig.knex);

class CronTab extends bookshelf.Model {
  get tableName() {
    return 'crontab';
  }

  get hasTimestamps() {
    return true;
  }

  static async findAll() {
    return this.fetchAll({ require: false });
  }

  static async findByType(type) {
    return this.where({ type }).fetch({ require: false });
  }

  static async save(job) {
    await new CronTab(job).save();
  }
}

module.exports = CronTab;
