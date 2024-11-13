// userService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// 사용자 프로필 가져오기
export const fetchUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/api/user/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// 프로필 업데이트 (이미지 포함)
export const updateUserProfile = async (userId, profileData) => {
  try {
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('bio', profileData.bio);
    if (profileData.image) {
      formData.append('image', profileData.image); // 이미지 파일 추가
    }

    const response = await axios.put(`${API_URL}/api/user/${userId}/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};