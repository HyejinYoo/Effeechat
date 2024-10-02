const express = require('express');
const cors = require('cors');  // CORS 미들웨어
const cookieParser = require('cookie-parser');  // 쿠키 파서 미들웨어
const authRoutes = require('./routes/auth');  // 라우터 경로
const app = express();
const port = 3001;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000',  // 프론트엔드 주소
  credentials: true  // 쿠키를 사용한 요청 허용
}));

// JSON 요청 바디 파싱
app.use(express.json());

// 쿠키 파서 사용
app.use(cookieParser());

// 기본 경로 설정
app.get('/', (req, res) => {
    res.send('Hello from the main app');
});

// 카카오 로그인 라우터 연결
app.use('/auth', authRoutes);

// 서버 실행
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
