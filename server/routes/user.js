const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 사용자 프로필 가져오기
router.get('/:userId/profile', userController.getUserProfile);

module.exports = router;