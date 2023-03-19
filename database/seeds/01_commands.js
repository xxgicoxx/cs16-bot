exports.seed = (knex) => knex('commands').del().then(() => knex('commands').insert([
  { command: '/server top', description: 'Top 10 players' },
  { command: '/server maps', description: 'List maps' },
  { command: '/server info', description: 'Server info' },
  { command: '/server start', description: 'Start server' },
  { command: '/server stop', description: 'Stop server' },
  { command: '/server address <b>{address}</b>', description: 'Change server address' },
  { command: '/server port <b>{port}</b>', description: 'Change server port' },
  { command: '/poll maps', description: 'Maps poll' },
  { command: '/cron start <b>{expression}</b>', description: 'Cron Job for auto start' },
  { command: '/cron stop <b>{expression}</b>', description: 'Cron Job for auto stop' },
  { command: '/cron pollmaps <b>{expression}</b>', description: 'Cron Job for auto map poll' },
  { command: '/help', description: 'Help' },
]));
