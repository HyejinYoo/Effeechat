const MentorPost = require('../models/MentorPost');


// 포스트 목록 조회 로직
exports.getPosts = async (req, res) => {
  try {
    const posts = await MentorPost.getPosts();
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error getting room list:', err);
    res.status(500).send('Error getting room list');
  }
};


// 포스트 생성 로직
exports.createPost = async (req, res) => {
  const { userId, title, content, category } = req.body;
  
  try {
    const postId = await MentorPost.createPost( userId, title, content, category || 0);
    res.status(201).send({ message: 'Post created', postId });
  } catch (err) {
    console.error('Error creating Post:', err);
    res.status(500).send('Error creating Post');
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
