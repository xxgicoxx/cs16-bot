require('dotenv').config();

process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require('node-telegram-bot-api');

const { telegramConfig } = require('./app/configs');
const { MessageController } = require('./app/controllers');

const bot = new TelegramBot(telegramConfig.token, {polling: true});

const messageController = new MessageController(bot);

messageController.cron();
messageController.handle();