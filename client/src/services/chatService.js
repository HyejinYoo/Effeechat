import axios from 'axios';
// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;

/**
 * 서버로 메시지를 전송하는 함수
 * @param {object} socket - 소켓 인스턴스
 * @param {number} roomId - 채팅방 ID
 * @param {number} senderId - 보낸 사람 ID
 * @param {string} message - 메시지 내용
 */
export const sendMessageToServer = (socket, roomId, senderId, message) => {
  if (socket) {
    socket.emit('chat message', { roomId, senderId, message });
  }
};


export const updateLastReadMessage = async (userId, roomId, messageId) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/chatRoom/${roomId}/last-read`,
      { userId, messageId }, // 요청 본문
      {
        withCredentials: true, // 쿠키를 포함하도록 설정
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating last read message:', error);
    throw error;
  }
};