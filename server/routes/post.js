const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');

// 채팅방 생성 API
router.post('/create', postController.createPost);

// 채팅방 입장 API
router.post('/join', postController.joinRoom);

// 채팅방 목록 조회 API
router.get('/list', postController.getPosts);

module.exports = router;