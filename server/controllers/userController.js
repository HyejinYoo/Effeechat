// userController.js
const User = require('../models/User');
const multer = require('multer');

// `multer` 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 파일 업로드 폴더
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// 프로필 조회
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '프로필 조회 오류' });
  }
};

// 프로필 업데이트
exports.updateUserProfile = [
  upload.single('image'), // 이미지 파일 처리
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const { username, bio } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      const updateData = { username, bio };
      if (image) updateData.image = image;

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: '프로필 업데이트 오류' });
    }
  }
];