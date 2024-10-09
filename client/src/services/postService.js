import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;

// 채팅방 목록 가져오기
export const fetchPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/post/list`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// 채팅방 생성하기
export const createPost = async (userId, title, content, category) => {
  try {
    const response = await axios.post(`${API_URL}/post/create`, {
      userId,
      title,
      content,
      category,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

