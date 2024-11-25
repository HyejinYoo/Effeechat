import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate 가져오기
import { fetchUserId } from '../services/authService';
import { fetchChatHistory, fetchRecipientInfo } from '../services/chatRoomService';
import { sendMessageToServer } from '../services/chatService';
import '../styles/ChatRoom.css';


const ChatRoom = ({ socket }) => {
  const { roomId } = useParams();
  const navigate = useNavigate(); // navigate 정의
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientImage, setRecipientImage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // setErrorMessage 정의
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
        if (error.response?.status === 403) {
          setErrorMessage('잘못된 접근입니다. 3초 후 메인 페이지로 이동합니다.');
          setTimeout(() => navigate('/'), 3000); // 3초 후 메인 페이지로 이동
        } else if (error.response?.status === 404) {
          setErrorMessage('채팅방을 찾을 수 없습니다. 3초 후 메인 페이지로 이동합니다.');
          setTimeout(() => navigate('/'), 3000); // 3초 후 메인 페이지로 이동
        } else {
          console.error('Failed to load chat history:', error);
        }
      }
    };
    loadChatHistory();
  }, [roomId, navigate]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
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

  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-room">
      {errorMessage ? (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <>
          <header className="chat-room-header">
            {recipientImage && <img src={recipientImage} alt="Recipient Profile" className="profile-image" />}
            <h3>{recipientName}</h3>
          </header>
  
          <div className="chat-messages">
            {chatMessages.map((msg, index) => {
              const showDateDivider =
                index === 0 || formatDate(msg.sent_at) !== formatDate(chatMessages[index - 1].sent_at);
  
              return (
                <React.Fragment key={index}>
                  {showDateDivider && <div className="date-divider">{formatDate(msg.sent_at)}</div>}
                  <div className={`chat-message-container ${msg.senderId === userId ? 'my-message' : 'other-message'}`}>
                    {msg.senderId !== userId && (
                      <img src={msg.profileImage || '/img/default_img.jpg'} alt="Sender Profile" className="profile-image" />
                    )}
                    <div className="chat-bubble">
                      <span>{msg.message}</span>
                    </div>
                    <span className={`message-time ${msg.senderId === userId ? 'time-left' : 'time-right'}`}>
                      {formatTime(msg.sent_at)}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
  
          <div className="chat-input-container">
            <textarea
              className="chat-textarea"
              rows="1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatRoom;