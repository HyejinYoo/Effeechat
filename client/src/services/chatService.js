// services/chatService.js

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