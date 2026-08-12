process.env.MYSQL_HOST = '127.0.0.1';
process.env.MYSQL_PORT = '3306';
process.env.MYSQL_USER = 'amigo';
process.env.MYSQL_PASSWORD = '123456';
process.env.MYSQL_DATABASE = 'my_personal_website';

console.log('env', {
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '***' : '',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
});

const { query } = await import('./utils/db.ts');
try {
  const rows = await query('SELECT 1 AS ok');
  console.log('query rows', rows);
} catch (error) {
  console.error('query error', error);
  process.exit(1);
}

const { getAllTables } = await import('./utils/tables.ts');
try {
  const tables = await getAllTables();
  console.log('getAllTables success', tables.slice(0, 2));
} catch (error) {
  console.error('getAllTables error', error);
  process.exit(1);
}
