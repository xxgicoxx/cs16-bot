const server = {
  hldsExe: process.env.HLDS_EXE || '',
  mapsPath: process.env.MAPS_PATH || '',
  cfg: process.env.SERVER_CFG_FILE || '',
  mapsFilter: process.env.MAPS_FILTER || '',
  stats: process.env.SERVER_CSSTATS_FILE || '',
  mapCycle: process.env.MAPS_MAPCYCLE_FILE || '',
  locale: process.env.LOCALE || 'en',
};

module.exports = server;
