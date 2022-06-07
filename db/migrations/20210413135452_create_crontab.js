exports.up = async (knex) => {
  const hasTable = await knex.schema.hasTable('crontab');

  if (!hasTable) {
    return knex.schema.createTable('crontab', (table) => {
      table.increments('id').primary();
      table.string('member');
      table.string('chat');
      table.string('type');
      table.string('expression');
      table.timestamps();
    });
  }

  return 0;
};

exports.down = (knex) => knex.schema.dropTable('crontab');
