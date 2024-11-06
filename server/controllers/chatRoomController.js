const ChatRoom = require('../models/ChatRoom');

// 채팅방 생성 또는 기존 방 확인 함수
exports.createOrGetChatRoom = async (req, res) => {
  const { postId, mentorId, menteeId } = req.body; // 포스트 ID와 멘토, 멘티 ID

  try {
    // 동일한 멘토-멘티 쌍의 채팅방이 있는지 확인
    let chatRoom = await ChatRoom.findExistingRoom(mentorId, menteeId, postId);
    
    if (!chatRoom) {
      // 기존 채팅방이 없다면 새로 생성
      const chatRoomId = await ChatRoom.createRoom(mentorId, menteeId, postId);
      chatRoom = { id: chatRoomId }; // 새로 생성된 방 ID
    }
    
    res.status(200).json(chatRoom);
  } catch (error) {
    console.error('Error creating or getting chat room:', error);
    res.status(500).send('Failed to create or get chat room');
  }
};

exports.verifyRoomAccess = async (req, res, next) => {
  const { chatRoomId } = req.params;
  const userId = req.user.id; // 로그인된 사용자 ID (JWT에서 가져온다고 가정)

  try {
    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (chatRoom && (chatRoom.mentorId === userId || chatRoom.menteeId === userId)) {
      // 사용자가 채팅방에 속해 있다면 다음 미들웨어로
      next();
    } else {
      // 접근 권한이 없다면 에러 반환
      res.status(403).json({ error: 'Access to this chat room is denied' });
    }
  } catch (error) {
    console.error('Error verifying room access:', error);
    res.status(500).send('Failed to verify room access');
  }
};

exports.getChatRoomById = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    // 예시로 DB에서 chatRoomId에 해당하는 채팅방을 조회하는 로직
    const chatRoom = await ChatRoom.findById(chatRoomId); // ChatRoom 모델 사용
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    res.json(chatRoom); // 채팅방 정보 반환
  } catch (error) {
    console.error('Error fetching chat room by ID:', error);
    res.status(500).send('Failed to fetch chat room');
  }
};