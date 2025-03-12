const express = require('express');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../middlewares/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const router = express.Router();


// 채팅방 생성 API (파일 업로드 지원)
router.post('/create', upload.array('files'), postController.createPost); 

// 채팅방 목록 조회 API
router.get('/list', postController.getPosts);

// 사용자 채팅방 목록 조회 API
router.get('/user-posts', authenticateUser, postController.getUserPosts);

// 포스트 삭제 API
router.delete('/:id', postController.deletePost);
// 포스트 수정 API
router.put('/:id', upload.array('files'), postController.updatePost);
// 특정 ID로 포스트 조회 API
router.get('/:id', postController.getPostById);



module.exports = router;