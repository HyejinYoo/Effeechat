const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/save', chatController.saveMessage); // 메시지 저장
router.get('/fetchMessages/:roomId', chatController.getMessagesByRoom); // 채팅 기록 가져오기



module.exports = router;