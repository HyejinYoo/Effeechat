const db = require('../config/db'); // 데이터베이스 연결 설정

// 사용자 저장을 위한 쿼리 함수
exports.findOrCreateUser = (kakaoId, nickname, username) => {
    return new Promise((resolve, reject) => {
        // 사용자가 존재하는지 확인
        db.query(
            'SELECT * FROM Users WHERE kakaoId = ?', 
            [kakaoId], 
            (err, results) => {
                if (err) return reject(err);

                if (results.length > 0) {
                    // 사용자가 이미 존재하는 경우
                    resolve(results[0]);
                } else {
                    // 새 사용자 생성
                    db.query(
                        'INSERT INTO Users (kakaoId, nickname, username) VALUES (?, ?, ?)', 
                        [kakaoId, nickname, username], 
                        (err, result) => {
                            if (err) return reject(err);
                            resolve({ kakaoId, nickname, username });
                        }
                    );
                }
            }
        );
    });
};