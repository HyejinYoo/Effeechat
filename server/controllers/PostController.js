const MentorPost = require('../models/MentorPost');
const File = require('../models/File');  
const uploadToS3 = require('../config/s3');  // S3 업로드 함수 불러오기


// 포스트 목록 조회 로직
exports.getPosts = async (req, res) => {
  try {
    // 포스트 목록을 가져옴
    const posts = await MentorPost.getPosts();

    // 각 포스트에 대해 파일 정보를 추가
    const postsWithFiles = await Promise.all(
      posts.map(async (post) => {
        const files = await File.getFilesByPostId(post.id);  // 각 포스트의 파일 목록을 가져옴
        return { ...post, files };  // 파일 정보를 포함한 포스트 데이터 반환
      })
    );

    res.status(200).json(postsWithFiles);
  } catch (err) {
    console.error('Error getting posts with files:', err);
    res.status(500).send('Error getting posts with files');
  }
};

// 포스트 생성
exports.createPost = async (req, res) => {
  const { userId, title, content, category, isChatAllowed } = req.body;
  const files = req.files || [];; ;  // 업로드된 파일들

  try {
    // 포스트 생성 후 ID 가져오기
    const postId = await MentorPost.createPost(userId, title, content, category, isChatAllowed);

    // 파일 업로드 및 DB에 파일 정보 저장
    if (files && files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          if (file) {
            // S3에 파일 업로드
            const uploadedFile = await uploadToS3(file);
            // 파일 정보를 Files 테이블에 저장
            await File.createFile(uploadedFile, file.originalname, postId, null);
          }
        })
      );
    }

    res.status(201).send({ message: 'Post created', postId });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Error creating post');
  }
};

// 포스트 삭제
exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    // 모델을 통해 포스트 삭제 처리
    await MentorPost.deletePostById(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};


// 채팅방 입장 로직
exports.joinRoom = async (req, res) => {
  const { mentorPostId, userId } = req.body;

  try {
    await MentorPost.joinRoom(mentorPostId, userId);
    res.status(200).send({ message: 'User joined the room' });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).send('Error joining room');
  }
};




// 포스트 업데이트
exports.updatePost = async (req, res) => {
  const postId = req.params.id;

  // req.body에서 데이터 추출
  const { title, content, category, isChatAllowed } = req.body;
  
  // req.body에서 배열로 전송된 기존 파일 및 삭제 파일 처리
  const deletedFiles = req.body.deletedFiles || []; // 배열로 받아서 바로 사용
  const existingFiles = req.body.existingFiles || []; // 배열로 받아서 바로 사용
  const newFiles = req.files || []; // 새로 업로드된 파일들 (multer로 처리)

  try {
    // 기존 포스트 찾기
    const existingPost = await MentorPost.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 포스트 업데이트
    await MentorPost.updatePost(postId, title, content, category, isChatAllowed);

    // 파일 삭제 처리
    if (deletedFiles.length > 0) {
      await File.deleteFilesByIds(deletedFiles);
    }

    // 새 파일 저장 처리
    if (newFiles.length > 0) {
      for (const file of newFiles) {
        // S3에 업로드 후 파일 정보 저장
        const uploadedFile = await uploadToS3(file);
        await File.createFile(uploadedFile, file.originalname, postId);
      }
    }

    res.status(200).send({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// 특정 ID로 포스트 조회
exports.getPostById = async (req, res) => {
  const postId = req.params.id;  // URL에서 ID 가져오기
  
  try {
    const post = await MentorPost.findById(postId);  // 모델에서 포스트 가져오기 
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });  // 포스트가 없을 경우 404 반환
    }
    
    const files = await File.getFilesByPostId(postId);  
    const postsWithFiles = { ...post, files };

    res.status(200).json(postsWithFiles);
    
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ error: 'Failed to fetch post' });  // 오류 발생 시 500 반환
  }
};


exports.getUserPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    const posts = await MentorPost.getUserPosts(userId); // 모델에서 사용자 게시물 목록 가져오기
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};