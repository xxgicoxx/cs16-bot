const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './database/cs16.sqlite',
  },
  useNullAsDefault: true,
});

module.exports.knex = knex;
