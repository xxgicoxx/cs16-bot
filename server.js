process.env.NTBA_FIX_319 = 1;

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const i18n = require('i18n');
const path = require('path');

const { serverConfig, telegramConfig } = require('./server/configs');
const { BotController } = require('./server/controllers');

const bot = new TelegramBot(telegramConfig.token, { polling: true });
const botController = new BotController(bot);

i18n.configure({
  locales: ['en', 'pt'],
  defaultLocale: serverConfig.locale,
  directory: path.join(__dirname, '/locales'),
});

botController.jobs();
botController.handle();
