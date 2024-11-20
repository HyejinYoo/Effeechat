const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// KakaoLogin 라우터 경로
router.get("/kakaoLogin", authController.kakaoLogin);
router.get("/check", authController.check);
router.post("/logout", authController.logout);

// 이메일 인증 API
router.post("/send-email", authController.sendVerificationEmail);
router.post("/verify-and-create-user", authController.verifyAndCreateUser);

module.exports = router;