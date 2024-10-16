import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;

// 포스트 목록 가져오기
export const fetchPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/post/list`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};



// 포스트 생성하기
export const createPost = async (data) => {


  try {
    const response = await axios.post(`${API_URL}/post/create`, data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating post with files:', error);
    throw error;
  }
};



// 새로 추가할 deletePost 함수
export const deletePost = async (postId) => {
  const response = await axios.delete(`${API_URL}/post/${postId}`);
  return response.data;
};

// 포스트 업데이트
export const updatePost = async (postId, data) => {

  const response = await axios.put(`${API_URL}/post/${postId}`, data);
  return response.data;
};


// 새로운 함수: 특정 포스트를 ID로 가져오는 함수
export const fetchPostById = async (postId) => {
  const response = await axios.get(`${API_URL}/post/${postId}`);

  console.log('!');
  console.log(response.data);
  return response.data;
};