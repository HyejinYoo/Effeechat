const db = require('../config/db');

// 채팅방 생성 함수
exports.createRoom = async (mentorId, menteeId) => {
  const query = `
    INSERT INTO ChatRooms (mentorId, menteeId) 
    VALUES (?, ?)
  `;
  const [result] = await db.query(query, [mentorId, menteeId]);
  return result.insertId; // 생성된 채팅방 ID 반환
};

// 특정 멘토와 멘티 간의 기존 채팅방이 있는지 확인하는 함수
exports.findExistingRoom = async (mentorId, menteeId) => {
  const query = `
    SELECT * FROM ChatRooms 
    WHERE mentorId = ? AND menteeId = ?
  `;
  const [rooms] = await db.query(query, [mentorId, menteeId]);
  return rooms.length > 0 ? rooms[0] : null; // 방이 있으면 해당 방 반환, 없으면 null 반환
};

// 채팅방 ID로 특정 채팅방을 조회하는 함수
exports.findById = async (chatRoomId) => {
  const query = `SELECT * FROM ChatRooms WHERE id = ?`;
  const [rooms] = await db.query(query, [chatRoomId]);
  return rooms.length > 0 ? rooms[0] : null; // 방이 있으면 해당 방 반환, 없으면 null 반환
};

