const uploadToS3 = require('../config/s3');
const db = require('../config/db');

// 사용자 저장을 위한 쿼리 함수
exports.findOrCreateUser = async (kakaoId, nickname, username, email) => {
    try {
        // 사용자가 존재하는지 확인
        const [results] = await db.query('SELECT * FROM Users WHERE kakaoId = ?', [kakaoId]);

        if (results.length > 0) {
            // 사용자가 이미 존재하는 경우
            return results[0];
        } else {
            // 새 사용자 생성
            const [result] = await db.query(
                'INSERT INTO Users (kakaoId, nickname, username, email) VALUES (?, ?, ?, ?)', 
                [kakaoId, nickname, username, email]
            );
            return { kakaoId, nickname, username, email};
        }
    } catch (err) {
        throw new Error('Error finding or creating user: ' + err.message);
    }
};


// 사용자 조회를 위한 함수 (kakaoId로 찾기)
exports.findUserByKakaoId = async (kakaoId) => {
  try {
    const query = 'SELECT id FROM Users WHERE kakaoId = ?';
    const [result] = await db.query(query, [kakaoId]);
    
    if (result.length > 0) {
      return result[0];  // 사용자 정보 반환
    } else {
      return null;  // 사용자가 없을 경우 null 반환
    }
  } catch (err) {
    throw new Error('Error fetching user by kakaoId: ' + err.message);
  }
};


// 사용자 프로필 정보 조회
exports.getUserProfileById = async (userId) => {
  try {
      const [rows] = await db.query('SELECT username, image FROM Users WHERE id = ?', [userId]);
      return rows[0];
  } catch (error) {
      throw new Error('Error fetching user profile: ' + error.message);
  }
};


// 사용자 프로필 업데이트 함수
exports.updateUserProfileById = async (userId, { username, image }) => {
  console.log("updateUserProfileById");
  try {
    // 업데이트할 필드와 값 배열 초기화
    const fields = [];
    const values = [];

    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }
    if (image !== undefined) {
      fields.push('image = ?');
      values.push(image);
    }

    if (fields.length === 0) {
      return; // 업데이트할 항목이 없는 경우 종료
    }

    // 동적으로 쿼리 생성
    const query = `UPDATE Users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(userId);

    await db.query(query, values);
  } catch (error) {
    throw new Error('Error updating user profile: ' + error.message);
  }
};

exports.findUserByEmail = async (email) => {
  try {
      const query = "SELECT * FROM Users WHERE email = ?";
      const [result] = await db.query(query, [email]);
      return result.length > 0 ? result[0] : null;
  } catch (err) {
      throw new Error("Error fetching user by email: " + err.message);
  }
};

exports.deleteUserById = async (userId) => {
  const updateUserQuery = `
    UPDATE Users
    SET kakaoId = NULL,
        username = '(알 수 없음)',
        nickname = '(알 수 없음)',
        email = NULL,
        image = NULL
    WHERE id = ?;
  `;

  const updatePostsQuery = `
    UPDATE MentorPosts
    SET is_open = false
    WHERE userId = ?;
  `;

  const connection = await db.getConnection(); // 연결 풀에서 개별 연결 가져오기

  try {
    // 트랜잭션 시작
    await connection.beginTransaction();

    // Users 테이블 업데이트
    await connection.query(updateUserQuery, [userId]);

    // MentorPosts 테이블 업데이트
    await connection.query(updatePostsQuery, [userId]);

    // 트랜잭션 커밋
    await connection.commit();
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await connection.rollback();
    console.error('Error updating user and posts in database:', error);
    throw error;
  } finally {
    connection.release(); // 연결 반환
  }
};