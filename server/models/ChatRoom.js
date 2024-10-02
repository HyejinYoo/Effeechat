const db = require('../config/db');


// 채팅방 목록 조회
exports.getRoomList = async () => {
  try {
    const query = `
      SELECT ChatRooms.*, COUNT(RoomParticipants.user_id) AS participants 
      FROM ChatRooms 
      LEFT JOIN RoomParticipants 
      ON ChatRooms.id = RoomParticipants.chat_room_id 
      GROUP BY ChatRooms.id;
    `;
    const [rooms] = await db.query(query); // 비동기 쿼리 실행
    return rooms;
  } catch (err) {
    throw new Error('Error fetching chat rooms: ' + err.message);
  }
};


//채팅방 생성
exports.createRoom = async (name, description, createdBy) => {
  try {
    const query = 'INSERT INTO ChatRooms (name, description, created_by) VALUES (?, ?, ?)';
    const result = await db.query(query, [name, description, createdBy]); // 비동기 쿼리 실행
    return result[0].insertId; // 쿼리의 첫 번째 결과에서 `insertId` 반환
  } catch (err) {
    throw new Error('Error creating room: ' + err.message);
  }
};


// 채팅방 참여자 추가
exports.joinRoom = async (userId, roomId) => {
  try {
    const query = 'INSERT INTO RoomParticipants (user_id, chat_room_id) VALUES (?, ?)';
    const result = await db.query(query, [userId, roomId]); // 비동기 쿼리 실행
    return result[0]; // 결과 반환
  } catch (err) {
    throw new Error('Error joining room: ' + err.message);
  }
};