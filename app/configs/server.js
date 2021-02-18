const server = {
  ip: process.env.SERVER_IP,
  hldsExe: process.env.HLDS_EXE,
  port: process.env.SERVER_PORT,
  admin: process.env.SERVER_ADMIN,
  mapsPath: process.env.MAPS_PATH,
  cfg: process.env.SERVER_CFG_FILE,
  mapsFilter: process.env.MAPS_FILTER,
  stats: process.env.SERVER_CSSTATS_FILE,
  mapCycle: process.env.MAPS_MAPCYCLE_FILE
};

module.exports = server;
