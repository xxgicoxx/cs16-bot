const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/cs16.sqlite',
  },
  useNullAsDefault: true,
});

module.exports.knex = knex;
