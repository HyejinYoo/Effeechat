const axios = require("axios");
const jwt = require('jsonwebtoken');  // JWT 추가
const User = require('../models/User');  // 사용자 모델 추가
const nodemailer = require('nodemailer');
const crypto = require('crypto');



require('dotenv').config();



const REST_API_KEY = process.env.REST_API_KEY;
const REDIRECT_URI = process.env.REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;  // 환경변수에서 JWT Secret 가져오기
const FRONTEND_URL = process.env.FRONTEND_URL; 

// 카카오 로그인 비즈니스 로직 처리
exports.kakaoLogin = async (req, res) => {
    let code = req.query.code;

    try {
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

        const userInfoResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const { id: kakaoId, properties: { nickname }, kakao_account: { email } } = userInfoResponse.data;

        // 이미 가입된 사용자 확인
        const user = await User.findUserByKakaoId(kakaoId);
        if (user) {
            const token = jwt.sign({ kakaoId, nickname }, JWT_SECRET, { expiresIn: '1h' });

            res.cookie('jwt_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000,
                sameSite: 'Strict',
                path: '/',
            });
            return res.redirect(FRONTEND_URL);
        }

        // 새 사용자: 이메일 인증 절차 필요
        res.redirect(`${FRONTEND_URL}/email-verification?email=${email}&kakaoId=${kakaoId}&nickname=${nickname}`);
    } catch (error) {
        console.error("Error during Kakao login:", error);
        res.status(500).json({ message: "Kakao login failed" });
    }
};



// JWT 토큰 검증을 위한 함수
exports.check = async (req, res) => {
    const token = req.cookies.jwt_token; // 쿠키에서 JWT 토큰 가져오기
  
    if (!token) {
      return res.json({ isAuthenticated: false, error: 'Authentication required' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);  // JWT 토큰 검증
      const kakaoId = decoded.kakaoId;  // JWT에서 카카오 ID 추출

      // 사용자 테이블에서 해당 kakaoId에 맞는 사용자 정보 조회
      const user = await User.findUserByKakaoId(kakaoId);
      
      if (!user) {
        return res.json({ isAuthenticated: false, message: "User not found" });
      }

      // 사용자 정보와 함께 응답
      res.json({ isAuthenticated: true, userId: user.id, user: decoded });
      
    } catch (error) {
      console.error("JWT verification failed:", error);  // 예외 로그 출력
      res.json({ isAuthenticated: false });
    }
};

// 로그아웃 처리 컨트롤러
exports.logout = (req, res) => {
    console.log("logout");
    res.clearCookie("jwt_token", {
      httpOnly: true,
      secure: false, // HTTPS에서만 사용
      sameSite: "Strict",
      path: "/",
    });
    res.status(200).send({ message: "Logged out successfully" });
  };

  


  exports.sendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    // 이메일 도메인 유효성 검사 (학교 이메일만 허용)
    if (!email.endsWith("@ewhain.net")) {
        return res.status(400).json({ message: "학교 이메일만 사용 가능합니다." });
    }

    // 인증 코드 생성 및 저장
    const code = crypto.randomInt(100000, 999999);
    verificationCodes[email] = {
        code,
        expires: Date.now() + 10 * 60 * 1000, // 10분 유효
    };

    // Nodemailer 설정
    const transporter = nodemailer.createTransport({
        host: "smtp.naver.com", // 네이버 SMTP 서버
        port: 465, // SSL 포트
        secure: true, // SSL/TLS 사용
        auth: {
            user: process.env.EMAIL_USER, // 네이버 이메일 계정
            pass: process.env.EMAIL_PASSWORD, // 앱 비밀번호 또는 계정 비밀번호
        },
    });

    try {
        // 이메일 전송
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // 보내는 사람
            to: email, // 받는 사람
            subject: "E-ffeeChat 이메일 인증 코드", // 제목
            text: `인증 코드는 ${code}입니다.`, // 내용
        });

        res.status(200).json({ message: "인증 코드가 이메일로 전송되었습니다." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "이메일 전송에 실패했습니다." });
    }
};


// 임시 인증 코드 저장소
let verificationCodes = {};

exports.verifyAndCreateUser = async (req, res) => {
    const { email, code, nickname, kakaoId } = req.body;

    const record = verificationCodes[email];
    if (!record) {
        return res.status(400).json({ message: "인증 코드를 요청하세요." });
    }

    if (record.code === parseInt(code) && record.expires > Date.now()) {
        delete verificationCodes[email];

        // 인증 완료 후 사용자 생성
        try {
            const user = await User.findOrCreateUser(kakaoId, nickname, nickname, email);
            res.status(200).json({ message: "회원가입 성공", user, redirectUrl: "/login" });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "회원가입 실패" });
        }
    } else {
        res.status(400).json({ message: "인증 코드가 유효하지 않거나 만료되었습니다." });
    }
};


exports.findAccount = async (req, res) => {
    const { schoolEmail } = req.body;

    // 학교 이메일 형식 검증
    if (!schoolEmail.endsWith("@ewhain.net")) {
        return res.status(400).json({ message: "학교 이메일만 입력 가능합니다." });
    }

    try {
        // 사용자를 학교 이메일로 조회
        const user = await User.findUserByEmail(schoolEmail);
        if (!user) {
            return res.status(404).json({ message: "해당 이메일로 등록된 사용자를 찾을 수 없습니다." });
        }

        // 닉네임 가져오기
        const nickname = user.nickname;

        // 이메일 전송 설정
        const transporter = nodemailer.createTransport({
            host: "smtp.naver.com", // SMTP 서버
            port: 465,
            secure: true, // SSL/TLS 사용
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // 이메일 전송
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: schoolEmail,
            subject: "E-ffeeChat 계정 찾기 안내",
            text: `안녕하세요! 요청하신 계정 정보입니다:\n\n닉네임: ${nickname}\n\n감사합니다.`,
        });

        res.status(200).json({ message: "계정 정보가 이메일로 전송되었습니다." });
    } catch (error) {
        console.error("Error finding account:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

// 이메일 마스킹 처리 함수
function maskEmail(email) {
    const [localPart, domain] = email.split("@");
    const maskedLocalPart = localPart.slice(0, 2) + "*".repeat(localPart.length - 2);
    return `${maskedLocalPart}@${domain}`;
}