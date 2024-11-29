const Chat = require('../models/Chat');

// 방별 채팅 기록 저장 (임시 메모리 저장소)
let chatHistory = {};  // chatHistory 변수를 모듈 범위에 선언

exports.handleMessage = (socket, io) => {
  socket.on('chat message', async (msg) => {
    const { roomId, senderId, message } = msg;

    console.log('Received message:', JSON.stringify(msg, null, 2));

    try {
      // 메시지를 데이터베이스에 저장하고 필요한 정보만 가져옴
      const savedMessage = await Chat.createMessage(roomId, senderId, message);


      console.log('savedMessage:', savedMessage);


      // 클라이언트에 필요한 정보만 전송
      io.to(roomId).emit('chat message', savedMessage);

      console.log('Message saved to database and sent to clients');
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
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




