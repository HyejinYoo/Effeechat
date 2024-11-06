// chatService.js
import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;
/**
 * 새로운 채팅방을 생성하거나 기존 채팅방을 가져오는 함수
 * @param {number} postId - 포스트 ID
 * @param {number} mentorId - 멘토 ID
 * @param {number} menteeId - 멘티 ID
 * @returns {Promise<number>} - 생성되거나 조회된 채팅방 ID
 */
export const createOrGetChatRoom = async (postId, mentorId, menteeId) => {
  try {
    const response = await axios.post(`${API_URL}/api/chatroom/createOrGet`, { postId, mentorId, menteeId });
    return response.data.id; // 채팅방 ID 반환
  } catch (error) {
    console.error('Failed to create or get chat room:', error);
    throw error; // 에러를 상위 호출 함수로 전달
  }
};