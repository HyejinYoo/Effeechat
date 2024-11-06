import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserId } from '../services/authService';
import { fetchChatHistory } from '../services/chatRoomService';
import { sendMessageToServer } from '../services/chatService';
import '../styles/ChatRoom.css';

const ChatRoom = ({ socket }) => {
  const { roomId } = useParams();
  const [userId, setUserId] = useState(null); // userId 상태 추가
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientImage, setRecipientImage] = useState('');
  const messagesEndRef = useRef(null);

  // 사용자 ID 가져오기
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await fetchUserId();
        setUserId(id); // userId 상태 설정
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
      }
    };
    getUserId();
  }, []);

  // 방에 들어갈 때 DB에서 메시지 불러오기
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const messages = await fetchChatHistory(roomId);
        setChatMessages(messages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadChatHistory();
  }, [roomId]);

  useEffect(() => {
    if (socket) {
      socket.emit('join room', roomId);

      const handleMessageReceive = (msg) => {
        setChatMessages((prevMessages) => [...prevMessages, msg]);
      };

      socket.on('chat message', handleMessageReceive);

      return () => {
        socket.off('chat message', handleMessageReceive);
        socket.emit('leave room', roomId);
      };
    }
  }, [roomId, socket]);

  // Scroll to bottom whenever chatMessages changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = () => {
    if (userId) { // userId가 설정되었을 때만 메시지 전송
      sendMessageToServer(socket, roomId, userId, message);
      setMessage('');
    }
  };

  return (
    <div className="chat-room">
      <header className="chat-room-header">
        {recipientImage && <img src={recipientImage} alt="Recipient Profile" className="profile-image" />}
        <h2>{recipientName}</h2>
      </header>

      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`chat-message-container ${msg.senderId === userId ? 'my-message' : 'other-message'}`}>
            {msg.senderId !== userId && (
              <img src={msg.profileImage || '/img/default_img.jpg'} alt="Sender Profile" className="profile-image" />
            )}
            <div className="chat-bubble">
              <span>{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For automatic scroll to bottom */}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;