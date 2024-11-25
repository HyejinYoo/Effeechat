const ChatRoom = require('../models/ChatRoom');
const Chat = require('../models/Chat'); // Chat 모델 가져오기


// 채팅방 생성 또는 기존 방 확인 함수
exports.createOrGetChatRoom = async (req, res) => {
  const {  mentorId, menteeId } = req.body; // 포스트 ID와 멘토, 멘티 ID

  try {
    // 동일한 멘토-멘티 쌍의 채팅방이 있는지 확인
    let chatRoom = await ChatRoom.findExistingRoom(mentorId, menteeId);
    
    if (!chatRoom) {
      // 기존 채팅방이 없다면 새로 생성
      const chatRoomId = await ChatRoom.createRoom(mentorId, menteeId);
      chatRoom = { id: chatRoomId }; // 새로 생성된 방 ID
    }
    
    res.status(200).json(chatRoom);
  } catch (error) {
    console.error('Error creating or getting chat room:', error);
    res.status(500).send('Failed to create or get chat room');
  }
};

exports.verifyRoomAccess = async (req, res, next) => {
  const { chatRoomId } = req.params; // URI에서 채팅방 ID 가져오기
  const userId = req.user.id; // JWT 또는 세션에서 인증된 사용자 ID 가져오기

  try {
      // 채팅방 정보 조회
      const chatRoom = await ChatRoom.findById(chatRoomId);

      if (!chatRoom) {
          return res.status(404).json({ message: 'Chat room not found' });
      }

      // 사용자가 멘토 또는 멘티로 채팅방에 참여 중인지 확인
      const isParticipant = chatRoom.mentorId === userId || chatRoom.menteeId === userId;

      if (!isParticipant) {
          return res.status(403).json({ message: 'Access to this chat room is denied' });
      }

      req.chatRoom = chatRoom; // 요청 객체에 채팅방 정보 저장
      next(); // 다음 미들웨어로 진행
  } catch (error) {
      console.error('Error verifying room access:', error);
      res.status(500).json({ message: 'Failed to verify room access' });
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

exports.getChatRoomMessages = async (req, res) => {
  const { chatRoomId } = req.params;
  try {
    const messages = await Chat.getMessagesByRoomId(chatRoomId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
};


// 상대방 정보를 조회하는 API
exports.getRecipientInfo = async (req, res) => {
  const { chatRoomId } = req.params;
  const userId = req.user.id; // 인증된 사용자의 ID

  try {
    // 상대방 ID 찾기
    const recipient = await ChatRoom.findRecipientByRoomId(chatRoomId, userId);
    if (recipient) {
      res.json({ username: recipient.username, profileImage: recipient.image });
    } else {
      res.status(404).json({ message: "Recipient not found" });
    }
  } catch (error) {
    console.error("Error fetching recipient info:", error);
    res.status(500).json({ error: "Failed to fetch recipient info" });
  }
};

exports.getUserChatRooms = async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await ChatRoom.getUserChats(userId); // 모델에서 사용자 채팅 목록 가져오기
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ error: 'Failed to fetch user chats' });
  }
};

