const express = require('express');
const router = express.Router();
const chatRoomsController = require('../controllers/chatRoomsController');

// 채팅방 생성 API
router.post('/create', chatRoomsController.createRoom);

// 채팅방 입장 API
router.post('/join', chatRoomsController.joinRoom);

// 채팅방 목록 조회 API
router.get('/list', chatRoomsController.getRoomList);

module.exports = router;