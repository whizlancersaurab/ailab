const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 20000, 
});


(async () => {
  try {
    const connection = await db.getConnection();
    console.log("MySQL connected successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  }
})();

module.exports = db;
