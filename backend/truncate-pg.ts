import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:augu1622@localhost:5432/chulhaksandb?schema=public'
  });

  await client.connect();

  try {
    const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public'`);
    for (const row of res.rows) {
      if (row.tablename !== '_prisma_migrations') {
        await client.query(`TRUNCATE TABLE "public"."${row.tablename}" CASCADE;`);
        console.log(`Truncated ${row.tablename}`);
      }
    }
    console.log('Database truncated successfully.');
  } catch (error) {
    console.error('Error truncating tables:', error);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
