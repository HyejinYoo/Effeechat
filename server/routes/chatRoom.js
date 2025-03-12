// chatRoomRoutes.js
const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// 채팅방 생성 또는 기존 방 반환 (사용자 인증 필요)
router.post('/createOrGet', chatRoomController.createOrGetChatRoom);

router.get('/user-chats', authenticateUser, chatRoomController.getUserChatRooms);

// 특정 채팅방 조회 (사용자 인증 및 접근 권한 검증 필요)
router.get('/:chatRoomId', authenticateUser, chatRoomController.verifyRoomAccess, chatRoomController.getChatRoomById);

router.put('/:chatRoomId/last-read', authenticateUser, chatRoomController.verifyRoomAccess, chatRoomController.updateLastReadMessage);

router.get('/:chatRoomId/recipient', authenticateUser, chatRoomController.verifyRoomAccess, chatRoomController.getRecipientInfo);

router.get('/:chatRoomId/messages', authenticateUser, chatRoomController.verifyRoomAccess, chatRoomController.getChatRoomMessages);



module.exports = router;