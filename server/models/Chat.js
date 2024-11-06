// ChatMessage.js
const db = require('../config/db');

// 메시지 생성 함수
exports.createMessage = async (roomId, senderId, message) => {
  const query = `
    INSERT INTO ChatMessages (chatRoomId, senderId, message, sent_at)
    VALUES (?, ?, ?, NOW())
  `;
  const [result] = await db.query(query, [roomId, senderId, message]);
  return result.insertId; // 생성된 메시지 ID 반환
};

// 특정 채팅방의 메시지를 시간순으로 조회하는 함수
exports.getMessagesByRoomId = async (roomId) => {
  const query = `SELECT ChatMessages.*, Users.image AS profileImage, Users.username
                 FROM ChatMessages
                 LEFT JOIN Users ON ChatMessages.senderId = Users.id
                 WHERE chatRoomId = ? ORDER BY sent_at ASC`;
  const [messages] = await db.query(query, [roomId]);
  return messages;
};