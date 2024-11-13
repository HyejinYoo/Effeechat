import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatItem.css';

const ChatItem = ({ chat }) => {
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
      // 연도가 다르면 'YYYY년 MM월 DD일 오전/오후 HH:MM' 형식으로 표시
      return `${year}년 ${month}월 ${day}일 ${period} ${formattedHours}:${minutes}`;
    } else if (month !== now.getMonth() + 1 || day !== now.getDate()) {
      // 연도는 같고 월/일이 다르면 'MM월 DD일 오전/오후 HH:MM' 형식으로 표시
      return `${month}월 ${day}일 ${period} ${formattedHours}:${minutes}`;
    } else {
      // 연도와 월/일이 모두 같으면 '오전/오후 HH:MM' 형식으로 표시
      return `${period} ${formattedHours}:${minutes}`;
    }
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