const server = {
  hldsPath: process.env.HLDS_PATH || '',
  mapsPath: process.env.MAPS_PATH || '',
  cfgPath: process.env.SERVER_CFG_PATH || '',
  mapsFilter: process.env.MAPS_FILTER || '',
  statsPath: process.env.SERVER_CSSTATS_PATH || '',
  mapsCyclePath: process.env.MAPS_MAPCYCLE_PATH || '',
  locale: process.env.LOCALE || 'en',
};

module.exports = server;
