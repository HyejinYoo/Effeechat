import React, { useState, useEffect } from 'react';
import { fetchUserId } from '../services/authService';
import { fetchUserChatRooms } from '../services/chatRoomService';
import { fetchUserPosts } from '../services/postService';
import '../styles/MyPage.css';

const MyPage = () => {
  const [userId, setUserId] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');

  // 사용자 ID 가져오기
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await fetchUserId();
        setUserId(id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    getUserId();
  }, []);

  // 채팅 목록 가져오기
  useEffect(() => {
    const loadUserChats = async () => {
      if (userId) {
        try {
          const chats = await fetchUserChatRooms(userId);
          setUserChats(chats);
        } catch (error) {
          console.error('Error fetching user chats:', error);
        }
      }
    };
    loadUserChats();
  }, [userId]);

  // 글 목록 가져오기
  useEffect(() => {
    const loadUserPosts = async () => {
      if (userId) {
        try {
          const posts = await fetchUserPosts(userId);
          setUserPosts(posts);
        } catch (error) {
          console.error('Error fetching user posts:', error);
        }
      }
    };
    loadUserPosts();
  }, [userId]);

  return (
    <div className="my-page-container">
      <h2>My Page</h2>
      <div className="tabs">
        <button onClick={() => setActiveTab('chats')} className={activeTab === 'chats' ? 'active' : ''}>
          Chat List
        </button>
        <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>
          Post List
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'chats' ? (
          <div>
            <h3>Your Chats</h3>
            <ul>
              {userChats.map((chat) => (
                <li key={chat.id}>{chat.title}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h3>Your Posts</h3>
            <ul>
              {userPosts.map((post) => (
                <li key={post.id}>{post.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;