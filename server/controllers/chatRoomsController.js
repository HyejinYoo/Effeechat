const ChatRoom = require('../models/ChatRoom');


// 채팅방 목록 조회 로직
exports.getRoomList = async (req, res) => {
  try {
    const rooms = await ChatRoom.getRoomList();
    res.status(200).json(rooms);
  } catch (err) {
    console.error('Error getting room list:', err);
    res.status(500).send('Error getting room list');
  }
};


// 채팅방 생성 로직
exports.createRoom = async (req, res) => {
  const { name, description, createdBy } = req.body;
  
  try {
    const roomId = await ChatRoom.createRoom(name, description, createdBy);
    res.status(201).send({ message: 'Chat room created', roomId });
  } catch (err) {
    console.error('Error creating chat room:', err);
    res.status(500).send('Error creating chat room');
  }
};

// 채팅방 입장 로직
exports.joinRoom = async (req, res) => {
  const { userId, roomId } = req.body;

  try {
    await ChatRoom.joinRoom(userId, roomId);
    res.status(200).send({ message: 'User joined the room' });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).send('Error joining room');
  }
};
