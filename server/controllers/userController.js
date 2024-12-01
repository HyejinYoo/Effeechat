const uploadToS3 = require('../config/s3');
const User = require('../models/User');

// 사용자 프로필 조회
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await User.getUserProfileById(userId);

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// 사용자 프로필 조회
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await User.getUserProfileById(userId);

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;
  const file = req.file;

  try {
      let imageUrl = null;

      // 파일이 있으면 S3에 업로드
      if (file) {
          imageUrl = await uploadToS3(file);
      } else {
          // 기존 사용자 정보를 가져와서 현재 이미지 유지
          const user = await User.getUserProfileById(userId);
          imageUrl = user.image;
      }

      // `username`이 빈 값이 아니면 업데이트 실행
      if (username || imageUrl) {
          await User.updateUserProfileById(userId, { 
              username: username || null, 
              image: imageUrl 
          });
      }

      res.json({ message: 'Profile updated successfully', imageUrl });
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.deleteUserAccount = async (req, res) => {
    const { userId } = req.params;
  
    try {
      // 사용자 삭제
      await User.deleteUserById(userId);
  
      // 성공 응답
      res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ error: 'Failed to delete user account' });
    }
  };