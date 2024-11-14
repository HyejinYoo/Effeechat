import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatItem.css';

const ChatItem = ({ chat, isMentor }) => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate(`/chat/${chat.roomId}`);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const period = hours < 12 ? '오전' : '오후';
    const formattedHours = hours % 12 || 12; // 0시는 12로 표시

    if (year !== now.getFullYear()) {
      return `${year}년 ${month}월 ${day}일 ${period} ${formattedHours}:${minutes}`;
    } else if (month !== now.getMonth() + 1 || day !== now.getDate()) {
      return `${month}월 ${day}일 ${period} ${formattedHours}:${minutes}`;
    } else {
      return `${period} ${formattedHours}:${minutes}`;
    }
  };

  return (
    <li className="chat-item" onClick={handleChatClick}>
      {/* 프로필 이미지 */}
      <img
        src={chat.otherUserProfileImage || '/img/default_img.jpg'}
        alt="Profile"
        className={`profile-image ${isMentor ? 'mentor-border' : ''}`} // 멘토일 경우 mentor-border 클래스 추가
      />
      {/* 채팅 정보 */}
      <div className="chat-details">
        <div className="chat-header">
          <h4 className="chat-title">{chat.otherUserName || 'Unknown User'}</h4>
          <span className="message-timestamp">
            {formatTimestamp(chat.lastMessageTimestamp)}
          </span>
        </div>
        <p className="last-message">{chat.lastMessage || 'No recent messages'}</p>
      </div>
    </li>
  );
};

export default ChatItem;