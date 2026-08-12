const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'amigo',
      password: '123456',
      database: 'my_personal_website',
    });
    console.log('connected');
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('rows', rows);
    await conn.end();
  } catch (e) {
    console.error('error', e && e.message);
    console.error(e);
    process.exit(1);
  }
})();
