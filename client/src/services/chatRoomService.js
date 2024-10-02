import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;

// 채팅방 목록 가져오기
export const fetchRooms = async () => {
  try {
    const response = await axios.get(`${API_URL}/chatRooms/list`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// 채팅방 생성하기
export const createRoom = async (roomName, description, createdBy) => {
  try {
    const response = await axios.post(`${API_URL}/chatRooms/create`, {
      name: roomName,
      description,
      createdBy,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

