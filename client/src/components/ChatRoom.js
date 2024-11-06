import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserId } from '../services/authService';
import { fetchChatHistory, fetchRecipientInfo } from '../services/chatRoomService'; // fetchRecipientInfo 추가
import { sendMessageToServer } from '../services/chatService';
import '../styles/ChatRoom.css';

const ChatRoom = ({ socket }) => {
  const { roomId } = useParams();
  const [userId, setUserId] = useState(null);
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
        setUserId(id);
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
      }
    };
    getUserId();
  }, []);

  // 상대방 정보 가져오기
  useEffect(() => {
    const loadRecipientInfo = async () => {
      try {
        const { name, image } = await fetchRecipientInfo(roomId, userId); // 상대방 이름과 이미지 가져오기
        setRecipientName(name);
        setRecipientImage(image);
      } catch (error) {
        console.error("Failed to load recipient info:", error);
      }
    };

    if (userId) {
      loadRecipientInfo();
    }
  }, [roomId, userId]);

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
    if (userId) {
      sendMessageToServer(socket, roomId, userId, message);
      setMessage('');
    }
  };

  return (
    <div className="chat-room">
      <header className="chat-room-header">
        {recipientImage && <img src={recipientImage} alt="Recipient Profile" className="profile-image" />}
        <h2>{recipientName || "Loading..."}</h2> {/* 상대방 이름 표시 */}
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
        <div ref={messagesEndRef} />
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