require('dotenv').config();  // .env 파일을 로드하는 dotenv 패키지
const express = require('express');
const cors = require('cors');  // CORS 미들웨어
const cookieParser = require('cookie-parser');  // 쿠키 파서 미들웨어
const http = require('http'); // Required for creating an HTTP server
const { Server } = require('socket.io'); // Import socket.io
const authRoutes = require('./routes/auth');  // 라우터 경로
const chatRoomsRoutes = require('./routes/chatRooms');
const app = express();
const db = require('./config/db');
const { handleMessage } = require('./controllers/chatController');

// HTTP 서버 생성
const server = http.createServer(app);

// .env 파일에서 포트와 프론트엔드 URL 읽기
const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL;

// Initialize socket.io with the HTTP server
const io = new Server(server, {
  cors: {
    origin: frontendUrl || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 데이터베이스 연결 (비동기)
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connected to the MySQL database!');
    connection.release();  // 연결 해제 (풀 사용 시 필요)
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
})();

// Socket.io 연결 처리
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room!~!: ${roomId}`);
  });

  // 채팅 메시지 처리 핸들러 호출
  handleMessage(socket, io);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// CORS 설정
app.use(cors({
  origin: frontendUrl || 'http://localhost:3000',  // 프론트엔드 주소
  credentials: true  // 쿠키 전송 허용
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

// 채팅방 라우터 연결
app.use('/chatRooms', chatRoomsRoutes);

// 서버 실행 (server.listen으로 변경)
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});