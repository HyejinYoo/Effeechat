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


router.post("/find-account", authController.findAccount);

router.post("/check-duplicate-email", authController.checkDuplicateEmail);

module.exports = router;