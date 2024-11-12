import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatItem.css';

const ChatItem = ({ chat }) => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate(`/chat/${chat.roomId}`); // chat.roomId를 사용하여 방 ID 전달
  };

  return (
    <li className="chat-item" onClick={handleChatClick}>
      {/* 프로필 이미지 */}
      <img
        src={chat.otherUserProfileImage || '/img/default_img.jpg'}
        alt="Profile"
        className="profile-image"
      />
      {/* 채팅 정보 */}
      <div className="chat-info">
        <h4 className="chat-title">{chat.otherUserName || 'Unknown User'}</h4>
        <p className="last-message">{chat.lastMessage || 'No recent messages'}</p>
      </div>
      {/* 최신 메시지 시간 */}
      <span className="message-timestamp">
        {chat.lastMessageTimestamp
          ? new Date(chat.lastMessageTimestamp).toLocaleTimeString()
          : ''}
      </span>
    </li>
  );
};

export default ChatItem;