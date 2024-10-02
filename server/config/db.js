const mysql = require('mysql2');
require('dotenv').config();

// 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,  // .env 파일에서 환경 변수 불러오기
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT // MySQL 기본 포트 3306
});

// 연결 시도
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});

module.exports = connection;