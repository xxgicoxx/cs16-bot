module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/cs16.sqlite',
    },
    useNullAsDefault: true,
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/database/migrations`,
    },
    seeds: {
      directory: `${__dirname}/database/seeds`,
    },
  },
  staging: {
    client: 'sqlite3',
    connection: {
      filename: './database/cs16.sqlite',
    },
    useNullAsDefault: true,
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/database/migrations`,
    },
    seeds: {
      directory: `${__dirname}/database/seeds`,
    },
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './database/cs16.sqlite',
    },
    useNullAsDefault: true,
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/database/migrations`,
    },
    seeds: {
      directory: `${__dirname}/database/seeds`,
    },
  },
};
