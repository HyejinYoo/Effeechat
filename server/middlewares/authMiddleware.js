const User = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// check 함수를 미들웨어로 변경
exports.authenticateUser = async (req, res, next) => {
    const token = req.cookies.jwt_token; // 쿠키에서 JWT 토큰 가져오기
    
    if (!token) {
      return res.status(401).json({ isAuthenticated: false, error: 'Authentication required' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);  // JWT 토큰 검증
      const kakaoId = decoded.kakaoId;  // JWT에서 카카오 ID 추출
  
      // 사용자 테이블에서 해당 kakaoId에 맞는 사용자 정보 조회
      const user = await User.findUserByKakaoId(kakaoId);
        
      if (!user) {
        return res.status(401).json({ isAuthenticated: false, message: "User not found" });
      }
  
      // 인증된 사용자 정보를 req.user에 저장
      req.user = { id: user.id, kakaoId: user.kakaoId, nickname: user.nickname };
      next(); // 인증 성공 시 다음 미들웨어로 이동
      
    } catch (error) {
      console.error("JWT verification failed:", error);
      res.status(403).json({ isAuthenticated: false, error: 'Invalid or expired token' });
    }
  };