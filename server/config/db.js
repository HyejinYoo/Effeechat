const mysql = require('mysql2/promise');
require('dotenv').config();

// 데이터베이스 풀 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // 기본 포트 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;