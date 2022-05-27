const { dbConfig } = require('../configs');
const bookshelf = require('bookshelf')(dbConfig.knex);

class User extends bookshelf.Model {
  get tableName() {
    return 'users';
  }

  get hasTimestamps() {
    return true;
  }

  static async findByUsername(username) {
    return this.where({ username }).fetch({ require: false });
  }

  static async findByUser(user) {
    return this.where({ user }).fetch({ require: false });
  }

  static async findByUserAndAdmin(user, admin) {
    return this.where({ user, admin }).fetch({ require: false });
  }

  static async isAdmin(user) {
    return (await this.findByUserAndAdmin(user, true)) != null;
  }

  static async isCreator(user) {
    return (await this.findByUserAndCreator(user, true)) != null;
  }

  static async save(user) {
    const count = await User.count();

    await new User({
      ...user,
      ...{
        admin: user.admin != null ? user.admin : count === 0,
        creator: user.id != null ? user.creator : count === 0,
      },
    }).save();
  }

  static async destroy(user) {
    await new User(user).destroy();
  }
}

module.exports = User;
