const fs = require('fs');
const path = require('path');
const taskkill = require('taskkill');
const { exec } = require('child_process');
const schedule = require('node-schedule');

const { serverConfig } = require('../configs');

class AdminService {
  
  async start(bot, chatId, id) {
    try {
      if(this.isAdmin(id)) {
        this.isRunning('hlds.exe', (status) => {
          if(!status) {
            exec(serverConfig.hldsExe);
          }

          bot.sendMessage(chatId, `Started 🥳`);
        });
      } else {
        bot.sendMessage(chatId, `Permission denied 😢`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async stop(bot, chatId, id) {
    try {
      if(this.isAdmin(id)) {
        await taskkill(['hlds.exe']);
        bot.sendMessage(chatId, `Stopped 💔`);
      } else {
        bot.sendMessage(chatId, `Permission denied 😢`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async pollMaps(bot, chatId, id) {
    try {
      if(this.isAdmin(id)) {
        fs.readdir(serverConfig.mapsPath, function (err, files) {
          if (err) {
            bot.sendMessage(chatId, `Path not found 😭`);
  
            return;
          } 
  
          let maps = [];
  
          files = files.filter((file) => {
            return path.extname(file).toLowerCase() === '.bsp' && (serverConfig.mapsFilter != null ? file.includes(serverConfig.mapsFilter) : true);
          });
  
          files.forEach((file) => {
            maps.push(file.replace('.bsp', ''));
          });
  
          maps = maps.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value);
  
          bot.sendPoll(chatId, 'Map poll', maps.slice(0, 10), {
            allows_multiple_answers: true,
            is_anonymous: false,
            open_period: 3600
          });
        });
      } else {
        bot.sendMessage(chatId, `Permission denied 😢`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async cron(bot, chatId, id, type, expression) {
    try {
      if(this.isAdmin(id)) {
        const cronConfig = fs.readFileSync(path.join(__dirname, '../../cron.json'));
        const cronConfigJson = JSON.parse(cronConfig);
        const job = schedule.scheduledJobs[`${chatId}${type}`];

        if(cronConfigJson[chatId]) {
          cronConfigJson[chatId][`${type}`] = expression;
        } else {
          cronConfigJson[chatId] = {
            [`${type}`]: expression
          }
        }

        if(job != null) {
          job.cancel();
        }
        
        if(expression != null && expression.trim() != "") {
          schedule.scheduleJob(`${chatId}${type}`, expression, () => {
            switch (type) {
              case "start":
                this.start(bot, chatId, null);
                break;
              case "stop":
                this.stop(bot, chatId, null);
                break;
              case "pollmaps":
                this.pollMaps(bot, chatId, null);
                break;
              default:
                break;
            }
          });
        }
     
        fs.writeFileSync(path.join(__dirname, '../../cron.json'), JSON.stringify(cronConfigJson), 'utf-8');

        bot.sendMessage(chatId, `Cron ${type} ${expression} ⏰`);
      } else {
        bot.sendMessage(chatId, `Permission denied 😢`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async jobs(bot) {
    const cronConfig = fs.readFileSync(path.join(__dirname, '../../cron.json'));
    const cronConfigJson = JSON.parse(cronConfig);

    Object.keys(cronConfigJson).forEach((chat) => {
      Object.keys(cronConfigJson[chat]).forEach((type) => {
        this.cron(bot, chat, null, type, cronConfigJson[chat][type]);
      });
    });
  }

  async updateMaps(pollOptions) {
    try {
      pollOptions = pollOptions.sort((a, b) => (a.voter_count < b.voter_count) ? 1 : -1)

      let firstMap = '';
      const mapCycleStream = fs.createWriteStream(`${serverConfig.mapCycle}`, { flags:'w' });

      pollOptions.forEach((option, index) => {
        index == 0 ? firstMap = option.text : mapCycleStream.write(`${option.text}\n`)
      })

      mapCycleStream.end();

      const serverCfg = fs.readFileSync(serverConfig.cfg).toString().split("\n");
      const newServerCfg = [];

      serverCfg.forEach((line) => {
        line.startsWith('map ') ? newServerCfg.push(`map ${firstMap}`) : newServerCfg.push(line);
      });

      const serverCfgStream = fs.createWriteStream(`${serverConfig.cfg}`, { flags:'w' });
      
      newServerCfg.forEach((line) => {
        serverCfgStream.write(`${line}\n`);
      });
      
      serverCfgStream.end();
    } catch (error) {
      console.error(error);
    }
  }
  
  isRunning(query, cb) {
    const platform = process.platform;
    let cmd = '';
    
    switch (platform) {
      case 'win32' : cmd = `tasklist`; break;
      case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
      case 'linux' : cmd = `ps -A`; break;
      default: break;
    }

    exec(cmd, (error, stdout, stderr) => {
      cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
  }

  isAdmin(id) {
    return id == null || serverConfig.admin == null || serverConfig.admin.split(",").includes(id.toString());
  }
}

module.exports = AdminService;
