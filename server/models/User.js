const db = require('../config/db'); // 데이터베이스 연결 설정

// 사용자 저장을 위한 쿼리 함수
exports.findOrCreateUser = async (kakaoId, nickname, username) => {
    try {
        // 사용자가 존재하는지 확인
        const [results] = await db.query('SELECT * FROM Users WHERE kakaoId = ?', [kakaoId]);

        if (results.length > 0) {
            // 사용자가 이미 존재하는 경우
            return results[0];
        } else {
            // 새 사용자 생성
            const [result] = await db.query(
                'INSERT INTO Users (kakaoId, nickname, username) VALUES (?, ?, ?)', 
                [kakaoId, nickname, username]
            );
            return { kakaoId, nickname, username };
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