const { dbConfig } = require('../configs');
const bookshelf = require('bookshelf')(dbConfig.knex);

class Command extends bookshelf.Model {
  get tableName() {
    return 'commands';
  }

  get hasTimestamps() {
    return true;
  }

  static async findAll() {
    return this.fetchAll({ require: false });
  }
}

module.exports = Command;
