import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'amigo',
  password: process.env.MYSQL_PASSWORD || '123456',
  database: process.env.MYSQL_DATABASE || 'my_personal_website',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  decimalNumbers: true,
})

let initialized = false

export async function ensureDbInitialized() {
  if (initialized) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tables (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tableNumber VARCHAR(64) NOT NULL,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      qrcode_addr VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tableId INT NOT NULL,
      tableNumber VARCHAR(64) NOT NULL,
      start DATETIME NULL,
      end DATETIME NULL,
      status TINYINT NOT NULL,
      usedTime VARCHAR(64) NOT NULL DEFAULT '0分钟',
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      INDEX idx_tableId (tableId),
      CONSTRAINT fk_order_table FOREIGN KEY (tableId) REFERENCES tables(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  try {
    await pool.query('ALTER TABLE orders ADD COLUMN usedTime VARCHAR(64) NOT NULL DEFAULT "0分钟"')
  } catch (e) {
    // ignore if column already exists
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      openid VARCHAR(255) NOT NULL,
      type VARCHAR(64) NOT NULL,
      target VARCHAR(255) NOT NULL,
      targetId INT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME NOT NULL,
      INDEX idx_openid (openid),
      INDEX idx_type (type),
      INDEX idx_target (target)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  initialized = true
}

export async function query(sql: string, params: any[] = []) {
  await ensureDbInitialized()
  const [rows] = await pool.query(sql, params)
  return rows as any[]
}

export async function execute(sql: string, params: any[] = []) {
  await ensureDbInitialized()
  const [result] = await pool.execute(sql, params)
  return result as mysql.ResultSetHeader
}
