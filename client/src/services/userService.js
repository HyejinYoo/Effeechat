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
export const updateUserProfile = async (userId, formData) => {
    try {
        const response = await axios.put(`${API_URL}/api/user/${userId}/profile`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

export const deleteUserAccount = async (userId) => {
  try {
    // 서버로 회원탈퇴 요청
    await axios.delete(`${API_URL}/api/user/${userId}`, {
      withCredentials: true, // 쿠키 포함
    });

    // 서버로 로그아웃 요청
    await axios.post(`${API_URL}/api/auth/logout`, null, {
      withCredentials: true, // 쿠키를 포함하여 요청
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};