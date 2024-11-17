const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// KakaoLogin 라우터 경로
router.get("/kakaoLogin", authController.kakaoLogin);
router.get("/check", authController.check);
router.post("/logout", authController.logout);

module.exports = router;