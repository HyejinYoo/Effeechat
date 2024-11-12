const express = require('express');
const postController = require('../controllers/postController');
//const fileController = require('../controllers/fileController');
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../middlewares/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const router = express.Router();


// 채팅방 생성 API (파일 업로드 지원)
router.post('/create', upload.array('files'), postController.createPost); // 'files'는 파일 필드의 이름

// 채팅방 목록 조회 API
router.get('/list', postController.getPosts);


router.get('/user-posts', authenticateUser, postController.getUserPosts);

// 포스트 삭제 API
router.delete('/:id', postController.deletePost);
router.put('/:id', upload.array('files'), postController.updatePost);
// 특정 ID로 포스트 조회 API
router.get('/:id', postController.getPostById);
//router.get('/files/:id', fileController.getFilesByPostId); // 파일 가져오기



module.exports = router;