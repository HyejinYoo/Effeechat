const express = require('express');
const router = express.Router();
const kakaoController = require('../controllers/kakaoController'); 

// KakaoLogin 라우터 경로
router.get("/kakaoLogin", kakaoController.kakaoLogin);
router.get("/check", kakaoController.check);

module.exports = router;