exports.up = async (knex) => {
  const hasTable = await knex.schema.hasTable('commands');

  if (!hasTable) {
    return knex.schema.createTable('commands', (table) => {
      table.increments('id').primary();
      table.string('command');
      table.string('description');
      table.timestamps();
    });
  }

  return 0;
};

exports.down = (knex) => knex.schema.dropTable('commands');
