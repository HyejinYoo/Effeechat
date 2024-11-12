import React, { useState, useEffect } from 'react';
import { fetchUserId } from '../services/authService';
import { fetchUserChatRooms } from '../services/chatRoomService';
import { fetchUserPosts, deletePost } from '../services/postService';
import { createOrGetChatRoom } from '../services/chatRoomService';
import { useNavigate } from 'react-router-dom';
import PostItem from './PostItem';
import PostModal from './PostModal';
import '../styles/MyPage.css';

const MyPage = () => {
  const [userId, setUserId] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const jobTitles = {
    1: 'IT/인터넷',
    2: '마케팅/광고/홍보',
    3: '경영/사무',
  };

  const navigate = useNavigate();

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

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleUpdatePost = () => {
    if (selectedPost) {
      navigate(`/update/${selectedPost.id}`);
    }
  };

  const handleDeletePost = async () => {
    if (selectedPost) {
      try {
        await deletePost(selectedPost.id);
        closeModal();
        setUserPosts(userPosts.filter((post) => post.id !== selectedPost.id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleQuestionClick = async () => {
    if (selectedPost && selectedPost.userId && userId) {
      try {
        const chatRoomId = await createOrGetChatRoom(selectedPost.userId, userId);
        navigate(`/chat/${chatRoomId}`);
      } catch (error) {
        console.error("Error initiating chat:", error);
      }
    }
  };

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
            <ul className="post-list">
              {userPosts.map((post) => (
                <PostItem key={post.id} post={post} jobTitles={jobTitles} onClick={handlePostClick} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {isModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
          jobTitles={jobTitles}
          userId={userId}
          closeModal={closeModal}
          handleUpdatePost={handleUpdatePost}
          handleDeletePost={handleDeletePost}
          handleQuestionClick={handleQuestionClick}
        />
      )}
    </div>
  );
};

export default MyPage;