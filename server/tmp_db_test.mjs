import mysql from 'mysql2/promise';

(async () => {
  const config = {
    host: '127.0.0.1',
    port: 3306,
    user: 'amigo',
    password: '123456',
    database: 'my_personal_website',
  };
  console.log('config', config);
  try {
    const conn = await mysql.createConnection(config);
    console.log('connected');
    const [rows] = await conn.query('SELECT DATABASE() AS db, USER() AS user');
    console.log('rows', rows);
    await conn.end();
  } catch (error) {
    console.error('error name', error.name);
    console.error('error code', error.code);
    console.error('error errno', error.errno);
    console.error('error sqlState', error.sqlState);
    console.error('error message', error.message);
    console.error('error stack', error.stack);
    process.exit(1);
  }
})();
