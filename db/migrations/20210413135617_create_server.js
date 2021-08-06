exports.up = async (knex) => {
  const hasTable = await knex.schema.hasTable('server');

  if (!hasTable) {
    return knex.schema.createTable('server', (table) => {
      table.increments('id').primary();
      table.string('chat');
      table.string('address');
      table.integer('port');
      table.timestamps();
    });
  }

  return 0;
};

exports.down = (knex) => knex.schema.dropTable('server');
