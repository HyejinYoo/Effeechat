const axios = require("axios");
const jwt = require('jsonwebtoken');  // JWT 추가
const User = require('../models/User');  // 사용자 모델 추가
require('dotenv').config();

const REST_API_KEY = process.env.REST_API_KEY;
const REDIRECT_URI = process.env.REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;  // 환경변수에서 JWT Secret 가져오기

// 카카오 로그인 비즈니스 로직 처리
exports.kakaoLogin = async (req, res) => {
    let code = req.query.code;

    try {
        // 엑세스 토큰 요청
        const tokenResponse = await axios.post("https://kauth.kakao.com/oauth/token", null, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            params: {
                grant_type: "authorization_code",
                client_id: REST_API_KEY,
                redirect_uri: REDIRECT_URI,
                code: code,
            },
        });

        let accessToken = tokenResponse.data.access_token;
        console.log("Access Token:", accessToken);

        // 사용자 정보 요청
        const userInfoResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
        });

        // 사용자 정보에서 id와 nickname을 추출
        const { id: kakaoId, properties: { nickname } } = userInfoResponse.data;

        // 사용자 정보를 데이터베이스에 저장하거나 기존 사용자 찾기
        const user = await User.findOrCreateUser(kakaoId, nickname, nickname);

        // JWT 토큰 생성
        const token = jwt.sign(
            {
                kakaoId: user.kakaoId,
                nickname: user.nickname,
            },
            JWT_SECRET,
            { expiresIn: '1h' }  // 토큰 만료 시간 설정 (1시간)
        );

        // JWT를 HTTP-Only 쿠키에 저장하여 프론트엔드로 전송
        res.cookie('jwt_token', token, {
            httpOnly: true, // 자바스크립트로 접근 불가
            secure: process.env.NODE_ENV === 'production', // HTTPS에서만 사용 (프로덕션 환경일 때)
            maxAge: 3600000, // 1시간 동안 유효
            sameSite: 'Strict' // 쿠키는 동일 사이트에서만 사용
        });

        // 성공적으로 로그인 후 리다이렉트
        res.redirect("http://localhost:3000/");

    } catch (error) {
        console.error("Error during Kakao login or fetching user info:", error);
        res.status(500).send("Kakao login failed");
    }
};

// JWT 토큰 검증을 위한 함수
exports.check = async (req, res) => {
    const token = req.cookies.jwt_token; // 쿠키에서 JWT 토큰 가져오기
  
    if (!token) {
      return res.json({ isAuthenticated: false });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);  // JWT 토큰 검증
      res.json({ isAuthenticated: true, user: decoded });
    } catch (error) {
      console.error("JWT verification failed:", error);  // 예외 로그 출력
      res.json({ isAuthenticated: false });
    }
};