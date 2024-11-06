import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserId } from '../services/authService';
import { fetchChatHistory, fetchRecipientInfo } from '../services/chatRoomService';
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

  useEffect(() => {
    const loadRecipientInfo = async () => {
      try {
        const { username, profileImage } = await fetchRecipientInfo(roomId, userId);
        setRecipientName(username);
        setRecipientImage(profileImage);
      } catch (error) {
        console.error("Failed to load recipient info:", error);
      }
    };
    if (userId) loadRecipientInfo();
  }, [roomId, userId]);

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
        console.log('Received message:', msg);
        setChatMessages((prevMessages) => [...prevMessages, msg]);
      };

      socket.on('chat message', handleMessageReceive);

      return () => {
        socket.off('chat message', handleMessageReceive);
        socket.emit('leave room', roomId);
      };
    }
  }, [roomId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        <h3>{recipientName}</h3>
      </header>

      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message-container ${msg.senderId === userId ? 'my-message' : 'other-message'}`}
          >
            {msg.senderId !== userId && (
              <img src={msg.profileImage || '/img/default_img.jpg'} alt="Sender Profile" className="profile-image" />
            )}
            <div className="chat-bubble">
              <span>{msg.message}</span>
              <span className={`message-time ${msg.senderId === userId ? 'time-left' : 'time-right'}`}>
                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          rows="1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;