const Chat = require('../models/Chat');

// 방별 채팅 기록 저장 (임시 메모리 저장소)
let chatHistory = {};  // chatHistory 변수를 모듈 범위에 선언

exports.handleMessage = (socket, io) => {
  socket.on('chat message', async (msg) => {
    const { roomId, senderId, message } = msg; // senderId도 추가

    console.log('message:', JSON.stringify(msg, null, 2));  // 메시지 로그 출력

    // 방별로 채팅 기록 저장 (데이터베이스 저장)
    try {
      // 메시지를 데이터베이스에 저장
      await Chat.createMessage(roomId, senderId, message);
      console.log('Message saved to database');
    } catch (error) {
      console.error('Error saving message to database:', error);
    }

    // 방에 있는 모든 클라이언트에게 메시지 전송
    io.to(roomId).emit('chat message', { roomId, senderId, message });
  });
};

exports.saveMessage = async (req, res) => {
  const { roomId, senderId, message } = req.body;
  try {
    const messageId = await Chat.createMessage(roomId, senderId, message);
    res.status(201).json({ message: 'Message saved', messageId });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).send('Failed to save message');
  }
};

exports.getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Chat.getMessagesByRoomId(roomId);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Failed to fetch messages');
  }
};

