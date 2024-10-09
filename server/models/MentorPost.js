const db = require('../config/db');


// 포스트 목록 조회
exports.getPosts = async () => {
  try {
    const query = `
      SELECT MentorPosts.*, Users.image, Users.username AS authorName, COUNT(ChatRooms.menteeId) AS mentees
      FROM MentorPosts
      LEFT JOIN ChatRooms ON MentorPosts.id = ChatRooms.mentorPostId
      LEFT JOIN Users ON MentorPosts.userId = Users.id 
      GROUP BY MentorPosts.id;
    `;
    const [posts] = await db.query(query); // 비동기 쿼리 실행
    return posts;
  } catch (err) {
    throw new Error('Error fetching posts: ' + err.message);
  }
};


//포스트 생성
exports.createPost = async (userId, title, content, category) => {
  try {
    const query = 'INSERT INTO MentorPosts (userId, title, content, category) VALUES (?, ?, ?, ?)';
    const result = await db.query(query, [userId, title, content, category]); // 비동기 쿼리 실행
    return result[0].insertId; // 쿼리의 첫 번째 결과에서 `insertId` 반환
  } catch (err) {
    throw new Error('Error creating post: ' + err.message);
  }
};



// 채팅방 참여
exports.joinRoom = async (mentorPostId, menteeId) => {
  try {
    const query = 'INSERT INTO ChatRooms (mentorPostId, menteeId) VALUES (?, ?)';
    const result = await db.query(query, [mentorPostId, menteeId]); // 비동기 쿼리 실행
    return result[0]; // 결과 반환
  } catch (err) {
    throw new Error('Error joining room: ' + err.message);
  }
};