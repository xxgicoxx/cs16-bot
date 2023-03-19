module.exports = Object.freeze({
  MESSAGE_PERMISSION_DENIED: 'Permission denied',
  MESSAGE_COMMANDS: 'Commands',
  MESSAGE_SERVER_STARTED: 'Server started',
  MESSAGE_SERVER_STOPPED: 'Server stopped',
  MESSAGE_MAPS_POLL: 'Maps poll',
  MESSAGE_TOP_10: 'Top 10',
  MESSAGE_FIRST_MAP: 'First Map',
  MESSAGE_MAP_CYCLE: 'Map Cycle',
  MESSAGE_ADDRESS: 'Address',
  MESSAGE_PORT: 'Port',
  MESSAGE_MAPS: 'Maps',

  COMMNAD_HELP: '/help',
  COMMAND_SERVER_START: 'start',
  COMMAND_SERVER_STOP: 'stop',
  COMMAND_SERVER_TOP: 'top',
  COMMAND_SERVER_MAPS: 'maps',
  COMMAND_SERVER_INFO: 'info',
  COMMAND_SERVER_ADDRESS: 'address',
  COMMAND_SERVER_PORT: 'port',
  COMMAND_POLL_MAPS: 'maps',

  COMMAND_SERVER_REGEX: /\/server (.+)/,
  COMMAND_POLL_REGEX: /\/poll (.+)/,
  COMMAND_CRON_REGEX: /\/cron (.+)/,

  ON_MESSAGE: 'message',
  ON_POLL: 'poll',
  ON_POLLING_ERROR: 'polling_error',

  CRON_TYPE_START: 'start',
  CRON_TYPE_STOP: 'stop',
  CRON_TYPE_POLLMAPS: 'pollmaps',

  CREATOR: 'creator',
  ADMIN: 'administrator',
  PARSE_MODE: 'html',
});
