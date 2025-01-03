const db = require('../config/db');


// 포스트 목록 조회
exports.getPosts = async () => {
  try {
    const query = `
      SELECT MentorPosts.*, Users.image, Users.username AS authorName, COUNT(ChatRooms.menteeId) AS mentees
      FROM MentorPosts
      LEFT JOIN ChatRooms ON MentorPosts.userId = ChatRooms.mentorId
      LEFT JOIN Users ON MentorPosts.userId = Users.id 
      GROUP BY MentorPosts.id
      ORDER BY MentorPosts.created_at DESC;
    `;
    const [posts] = await db.query(query); // 비동기 쿼리 실행
    return posts;
  } catch (err) {
    throw new Error('Error fetching posts: ' + err.message);
  }
};

// 특정 ID로 포스트를 가져오는 함수
exports.findById = async (postId) => {
  try {
    const query = `
      SELECT MentorPosts.*, Users.image, Users.username AS authorName, COUNT(ChatRooms.menteeId) AS mentees
      FROM MentorPosts
      LEFT JOIN ChatRooms ON MentorPosts.userId = ChatRooms.mentorId
      LEFT JOIN Users ON MentorPosts.userId = Users.id
      WHERE MentorPosts.id = ?  
      GROUP BY MentorPosts.id;
    `;
    
    const [post] = await db.query(query, [postId]); // MySQL 쿼리 실행
    return post[0]; // 단일 포스트 반환
  } catch (err) {
    throw new Error('Error fetching post by ID: ' + err.message);
  }
};

//포스트 생성
exports.createPost = async (userId, title, content, category, isChatAllowed) => {
  try {
    console.log('isChatAllowed');

    console.log(isChatAllowed);

    const query = 'INSERT INTO MentorPosts (userId, title, content, category, is_open) VALUES (?, ?, ?, ?, ?)';
    const result = await db.query(query, [userId, title, content, category, isChatAllowed]); 
    return result[0].insertId; // 쿼리의 첫 번째 결과에서 `insertId` 반환
  } catch (err) {
    throw new Error('Error creating post: ' + err.message);
  }
};



// 포스트 삭제 (MySQL에서 해당 ID의 포스트를 삭제하는 함수)
exports.deletePostById = async (postId) => {
  const query = 'DELETE FROM MentorPosts WHERE id = ?';
  try {
    await db.query(query, [postId]); // MySQL에서 삭제 쿼리 실행
  } catch (error) {
    throw new Error('Error deleting post: ' + error.message);
  }
};



// 포스트 업데이트
exports.updatePost = async (postId, title, content, category, isChatAllowed) => {
  console.log('updatepost/model');
  //console.log('title: '+title); undefined
  //console.log('postid: '+postId); 62
  console.log(isChatAllowed);
  const query = `
    UPDATE MentorPosts
    SET title = ?, content = ?, category = ?, is_open = ?
    WHERE id = ?
  `;

  // 매개변수의 순서를 쿼리 내에서 사용된 순서에 맞게 배열로 전달
  const [result] = await db.query(query, [title, content, category, isChatAllowed, postId]);
  
  // 결과 확인
  console.log('Update result:', result);

  return result;
};

// 업데이트된 포스트 반환
exports.getUpdatedPost = async (postId) => {
  const query = 'SELECT * FROM MentorPosts WHERE id = ?';
  const [rows] = await db.query(query, [postId]);
  return rows[0]; // 업데이트된 포스트 반환
};



// 특정 사용자의 포스트 목록 조회
exports.getUserPosts = async (userId) => {
  const query = `
    SELECT MentorPosts.*, Users.image, Users.username AS authorName
    FROM MentorPosts
    LEFT JOIN Users ON MentorPosts.userId = Users.id 
    WHERE MentorPosts.userId = ?
    ORDER BY MentorPosts.created_at DESC;
  `;

  try {
    const [rows] = await db.execute(query, [userId]);
    return rows; // 조회한 게시물 목록 반환
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};