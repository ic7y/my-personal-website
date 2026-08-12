import mysql from 'mysql2/promise';

(async () => {
  const config = {
    host: '127.0.0.1',
    port: 3306,
    user: 'amigo',
    password: '123456',
    database: 'my_personal_website',
  };
  try {
    const conn = await mysql.createConnection(config);
    const [tables] = await conn.query("SHOW TABLES");
    console.log('tables', tables);
    const [rows] = await conn.query("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'my_personal_website' AND TABLE_NAME IN ('tables','orders')");
    console.log('counts', rows);
    await conn.end();
  } catch (error) {
    console.error('db inspect error', {
      name: error.name,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      message: error.message,
    });
    process.exit(1);
  }
})();
