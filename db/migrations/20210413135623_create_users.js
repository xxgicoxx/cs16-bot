exports.up = async (knex) => {
  const hasTable = await knex.schema.hasTable('users');

  if (!hasTable) {
    return knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('user');
      table.string('chat');
      table.string('username');
      table.boolean('admin');
      table.boolean('creator');
      table.timestamps();
    });
  }

  return 0;
};

exports.down = (knex) => knex.schema.dropTable('users');
