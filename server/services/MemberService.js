const { constants } = require('../utils');

class MemberService {
  async isAdmin(bot, chat, from) {
    if (from.bot) {
      return true;
    }

    const member = await bot.getChatMember(chat.id, from.id);

    return (member.status === constants.ADMIN);
  }

  async isCreator(bot, chat, from) {
    if (from.bot) {
      return true;
    }

    const member = await bot.getChatMember(chat.id, from.id);

    return (member.status === constants.CREATOR);
  }

  async isAdminOrCreator(bot, chat, from) {
    if (from.bot) {
      return true;
    }

    const member = await bot.getChatMember(chat.id, from.id);

    return (member.status === constants.ADMIN || member.status === constants.CREATOR);
  }
}

module.exports = MemberService;
