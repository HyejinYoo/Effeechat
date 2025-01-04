import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserId } from '../services/authService';
import { fetchChatHistory, fetchRecipientInfo } from '../services/chatRoomService';
import { sendMessageToServer, updateLastReadMessage } from '../services/chatService';
import '../styles/ChatRoom.css';

const ChatRoom = ({ socket }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientImage, setRecipientImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await fetchUserId();
        setUserId(id);
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    const loadRecipientInfo = async () => {
      try {
        const { username, profileImage } = await fetchRecipientInfo(roomId, userId);
        console.log("profileImage:", profileImage);
        setRecipientName(username);
        setRecipientImage(profileImage || '/img/default_img.jpg'); // 기본 이미지를 설정
        console.log("Recipient info loaded:", username, profileImage);
      } catch (error) {
        console.error('Failed to load recipient info:', error);
      }
    };

    if (userId) {
      loadRecipientInfo();
    }
  }, [roomId, userId]);

  useEffect(() => {
    console.log("Recipient name updated:", recipientName);
    console.log("Recipient image updated:", recipientImage);
  }, [recipientName, recipientImage]);


  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId) return;
      try {
        const messages = await fetchChatHistory(roomId);
        setChatMessages(messages);

        if (messages.length > 0) {
          const lastMessageId = messages[messages.length - 1].id;
          console.log(`Updating last read message for userId: ${userId}`);
          await updateLastReadMessage(userId, roomId, lastMessageId);
        }
      } catch (error) {
        if (error.response?.status === 403) {
          setErrorMessage('잘못된 접근입니다. 3초 후 메인 페이지로 이동합니다.');
          setTimeout(() => navigate('/'), 3000);
        } else if (error.response?.status === 404) {
          setErrorMessage('채팅방을 찾을 수 없습니다. 3초 후 메인 페이지로 이동합니다.');
          setTimeout(() => navigate('/'), 3000);
        } else {
          console.error('Failed to load chat history:', error);
        }
      }
    };
    loadChatHistory();
  }, [roomId, navigate, userId]);

  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit('join room', roomId);

    const handleMessageReceive = async (msg) => {
      console.log('Received message:', msg);
      setChatMessages((prevMessages) => [...prevMessages, msg]);

      if (msg.id) {
        console.log('Updating last read for userId:', userId);
        await updateLastReadMessage(userId, roomId, msg.id);
      }
    };

    socket.on('chat message', handleMessageReceive);

    return () => {
      socket.off('chat message', handleMessageReceive);
      socket.emit('leave room', roomId);
    };
  }, [roomId, socket, userId]);

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

  const handleGoBack = () => {
    navigate(-1);
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
            <button className="back-button" onClick={handleGoBack}>
              <img src="/img/back_button.png" alt="Back" className="back-button-image" />
            </button>
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
                      <img src={recipientImage} alt="Sender Profile" className="profile-image" />
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
            <button onClick={sendMessage} className="send-button">
              <img src="/img/arrow.png" alt="Send" className="send-icon" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatRoom;