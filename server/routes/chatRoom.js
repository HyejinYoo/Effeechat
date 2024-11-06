// chatRoomRoutes.js
const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController');


// 채팅방 생성 또는 기존 방 반환 (사용자 인증 필요)
router.post('/createOrGet', chatRoomController.createOrGetChatRoom);

// 특정 채팅방 조회 (사용자 인증 및 접근 권한 검증 필요)
router.get('/:chatRoomId', chatRoomController.verifyRoomAccess, chatRoomController.getChatRoomById);

module.exports = router;