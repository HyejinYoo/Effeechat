
const File = require('../models/File'); // 파일 경로와 파일이 맞는지 확인
/*
exports.getFilesByPostId = async (req, res) => {
    const postId = req.params.postId;
    
    try {
      const files = await File.getFilesByPostId(postId); // 파일 모델에서 파일 목록 가져오기
      res.status(200).json(files);
    } catch (error) {
      console.error('Error fetching files for post:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  };
  */