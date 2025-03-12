import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;



export const createOrGetChatRoom = async (mentorId, menteeId) => {
  try {
    const response = await axios.post(`${API_URL}/api/chatRoom/createOrGet`, { mentorId, menteeId });
    return response.data.id; 
  } catch (error) {
    console.error('Failed to create or get chat room:', error);
    throw error; 
  }
};


export const fetchChatHistory = async (roomId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chatroom/${roomId}/messages`, {
        withCredentials: true // 쿠키에 있는 JWT 토큰을 서버로 전송
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  };

export const fetchRecipientInfo = async (roomId, userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chatRoom/${roomId}/recipient`, {
        withCredentials: true,
        params: { userId } // 요청에 userId를 포함하여 상대방 정보 요청
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recipient info:', error);
      throw error;
    }
  };

  export const fetchUserChatRooms = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chatRoom/user-chats`, {
        params: { userId },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  };