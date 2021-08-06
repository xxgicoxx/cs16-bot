const { dbConfig } = require('../configs');
const bookshelf = require('bookshelf')(dbConfig.knex);

class Server extends bookshelf.Model {
  get tableName() {
    return 'server';
  }

  get hasTimestamps() {
    return true;
  }

  static async findLast() {
    return this.query((qb) => {
      qb.orderBy('created_at', 'desc');
      qb.limit(1);
    }).fetch({ require: false });
  }

  static async save(server) {
    await new Server(server).save();
  }
}

module.exports = Server;
