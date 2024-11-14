import React, { useState, useEffect } from 'react';
import { fetchUserId } from '../services/authService';
import { fetchUserProfile, updateUserProfile } from '../services/userService';
import { fetchUserChatRooms } from '../services/chatRoomService';
import { fetchUserPosts, deletePost } from '../services/postService';
import { createOrGetChatRoom } from '../services/chatRoomService';
import { useNavigate } from 'react-router-dom';
import PostItem from './PostItem';
import PostModal from './PostModal';
import ChatItem from './ChatItem';
import '../styles/MyPage.css';

const MyPage = () => {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({ username: '', image: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ username: '', image: null });
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
    const loadUserProfile = async () => {
      if (userId) {
        try {
          const profile = await fetchUserProfile(userId);
          setUserProfile(profile);
          setEditedProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    loadUserProfile();
  }, [userId]);

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

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditedProfile((prevProfile) => ({
        ...prevProfile,
        image: e.target.files[0], // 파일 객체 저장
      }));
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        image: URL.createObjectURL(e.target.files[0]) // 미리보기 URL 설정
      }));
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('username', editedProfile.username);
    if (editedProfile.image) {
      formData.append('image', editedProfile.image); // 이미지 파일 추가
    }
  
    try {
      await updateUserProfile(userId, formData);
      // 업데이트 후 프로필 정보를 다시 로드
      const updatedProfile = await fetchUserProfile(userId);
      setUserProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };


  return (
    <div className="my-page-container">
      {/* User Profile Section */}
      <div className="profile-box">
        <div className="profile-section">
        {isEditingProfile ? (
          <div className="profile-info">
            <div className="profile-image-container">
              <img src={userProfile.image || '/img/default_img.jpg'} alt="Profile preview" className="profile-image" />
              <label htmlFor="file-upload" className="edit-icon">
                <img src="/img/image_edit_icon.png" alt="Edit Profile" />
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </div>
            <input
              type="text"
              value={editedProfile.username || ''}
              onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
              placeholder="Enter your username"
            />
            <button onClick={handleSaveProfile}>Save</button>
          </div>
        ) : (
          <div className="profile-info">
            <img
              src={userProfile.image || '/img/default_img.jpg'}
              alt="Profile"
              className="profile-image"
            />
            <h3>{userProfile.username || 'User'}</h3>
            <img
              src="/img/edit_icon.png"
              alt="Edit Profile"
              className="edit-button"
              onClick={handleEditProfile}
            />
          </div>
        )}
        </div>
      </div>


      <div className="tabs">
        <button onClick={() => setActiveTab('chats')} className={activeTab === 'chats' ? 'active' : ''}>
          My ChatRooms
        </button>
        <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>
          My Posts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'chats' ? (
          <div>
            <ul className="chat-list">
              {userChats.map((chat) => (
                <ChatItem 
                  key={chat.roomId} 
                  chat={chat} 
                  isMentor={chat.mentorId === userId ? false : true} // 상대방이 멘토인지 확인
                />
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <ul className="post-list post-list-my">
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