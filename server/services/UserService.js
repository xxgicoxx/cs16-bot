const i18n = require('i18n');

const { User } = require('../models');
const logger = require('../../logger');
const constants = require('../utils/constants');

class UserService {
  async admin(bot, chat, from, username, admin) {
    try {
      const user = await User.findByUser(from.id);
      const targetUser = await User.findByUsername(username);

      if (!this.isAdmin(user)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      if (targetUser == null) {
        await bot.sendMessage(chat.id, i18n.__(constants.USER_NOT_FOUND, { username }));
        return;
      }

      if (this.isCreator(targetUser)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      await User.save({ id: targetUser.id, admin: admin === 'true' });
      await bot.sendMessage(chat.id, i18n.__(constants.USER_UPDATED, { username }));
    } catch (error) {
      logger.error(error);
    }
  }

  async register(bot, chat, from) {
    try {
      const user = await User.findByUser(from.id);
      await User.save({
        id: user != null ? user.id : null,
        user: from.id,
        chat: chat.id,
        username: from.username,
        admin: user != null ? user.get(constants.ROLE_ADMIN) : null,
      });

      await bot.sendMessage(chat.id, i18n.__(constants.USER_REGISTRED, {
        username: from.username,
      }));
    } catch (error) {
      logger.error(error);
    }
  }

  async del(bot, chat, from) {
    try {
      const user = await User.findByUser(from.id);

      if (user == null) {
        await bot.sendMessage(chat.id, i18n.__(constants.USER_NOT_FOUND, {
          username: from.username,
        }));
        return;
      }

      if (this.isCreator(user)) {
        await bot.sendMessage(chat.id, i18n.__(constants.PERMISSION_DENIED));
        return;
      }

      await User.destroy({ id: user != null ? user.id : null });
      await bot.sendMessage(chat.id, i18n.__(constants.USER_DELETED, { username: from.username }));
    } catch (error) {
      logger.error(error);
    }
  }

  isCreator(user) {
    return user.get(constants.ROLE_CREATOR);
  }

  isAdmin(user) {
    return user.get(constants.ROLE_ADMIN);
  }
}

module.exports = UserService;
