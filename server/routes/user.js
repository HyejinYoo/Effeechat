const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');

const upload = multer();



// 사용자 프로필 가져오기
router.get('/:userId/profile',  upload.single('image'), userController.getUserProfile);

// 사용자 프로필 업데이트
router.put('/:userId/profile',  upload.single('image'), userController.updateUserProfile);




module.exports = router;