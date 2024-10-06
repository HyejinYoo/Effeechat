// 방별 채팅 기록 저장 (임시 메모리 저장소)
let chatHistory = {};  // chatHistory 변수를 모듈 범위에 선언

const handleMessage = (socket, io) => {
  socket.on('chat message', (msg) => {
    const { roomId, message } = msg;

    console.log('message:', JSON.stringify(msg, null, 2));  // 메시지 로그 출력

    // 방별로 채팅 기록 저장
    if (!chatHistory[roomId]) {
      chatHistory[roomId] = [];  // 방 ID에 해당하는 배열이 없으면 초기화
    }
    chatHistory[roomId].push(message);

    // 방에 있는 모든 클라이언트에게 메시지 전송
    io.to(roomId).emit('chat message', { roomId, message });
  });
};

module.exports = { handleMessage };