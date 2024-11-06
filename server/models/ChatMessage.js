// ChatMessage.js
const db = require('../config/db');

// 메시지 생성 함수
exports.createMessage = async (chatRoomId, userId, message) => {
  const query = `INSERT INTO ChatMessages (chatRoomId, userId, message) VALUES (?, ?, ?)`;
  const [result] = await db.query(query, [chatRoomId, userId, message]);
  return result.insertId; // 삽입된 메시지의 ID 반환
};

// 특정 채팅방의 메시지를 시간순으로 조회하는 함수
exports.getMessagesByRoomId = async (chatRoomId) => {
  const query = `SELECT * FROM ChatMessages WHERE chatRoomId = ? ORDER BY sent_at ASC`;
  const [messages] = await db.query(query, [chatRoomId]);
  return messages;
};