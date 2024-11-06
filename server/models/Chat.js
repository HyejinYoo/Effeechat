// ChatMessage.js
const db = require('../config/db');

// 메시지 생성 함수
exports.createMessage = async (roomId, senderId, message) => {
  // 메시지를 데이터베이스에 삽입
  const insertQuery = `
    INSERT INTO ChatMessages (chatRoomId, senderId, message, sent_at)
    VALUES (?, ?, ?, NOW())
  `;
  const [result] = await db.query(insertQuery, [roomId, senderId, message]);

  // 삽입된 메시지 ID로 필요한 정보만 다시 조회
  const messageId = result.insertId;
  const selectQuery = `
    SELECT senderId, message, sent_at 
    FROM ChatMessages
    WHERE id = ?
  `;
  const [messages] = await db.query(selectQuery, [messageId]);

  return messages[0]; // 필요한 필드만 포함된 메시지 정보 반환
};

// 특정 채팅방의 메시지를 시간순으로 조회하는 함수
exports.getMessagesByRoomId = async (roomId) => {
  const query = `SELECT ChatMessages.*, Users.image AS profileImage, Users.username
                 FROM ChatMessages
                 LEFT JOIN Users ON ChatMessages.senderId = Users.id
                 WHERE chatRoomId = ? ORDER BY sent_at ASC`;
  const [messages] = await db.query(query, [roomId]);
  return messages;
}