import React, { useState, useEffect } from 'react';
import { fetchUserId } from '../services/authService';
import { fetchUserChatRooms } from '../services/chatRoomService';
import { fetchUserPosts, deletePost } from '../services/postService';
import '../styles/MyPage.css';

import { createOrGetChatRoom } from '../services/chatRoomService'; // createOrGetChatRoom 추가
import { useNavigate } from 'react-router-dom'; // useNavigate 추가

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


  const navigate = useNavigate(); // navigate 초기화

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

  // 포스트 수정 함수
  const handleUpdatePost = () => {
    if (selectedPost) {
      navigate(`/update/${selectedPost.id}`);
    }
  };

  // 포스트 삭제 함수
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

  // 질문하기 클릭 함수
  const handleQuestionClick = async () => {
    if (selectedPost && selectedPost.userId && userId) {
      // 채팅방 ID를 생성하거나 가져오기
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
                <li
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className={post.is_open ? 'post-item room-open' : 'post-item room-closed'}
                >
                  <div className={`post-content ${post.is_open ? '' : 'closed-room'}`}>
                    <div className="post-header">
                      <div className="author-info">
                        <img
                          src={post.image ? post.image : '/img/default_img.jpg'}
                          alt="mentor"
                          className="mentor-icon"
                        />
                      </div>
                      <div className="post-info">
                        <div className="post-title-row">
                          <strong>{post.title}</strong>
                          {post.category !== 0 && (
                            <span className="post-category">{jobTitles[post.category]}</span>
                          )}
                        </div>
                        <p>{post.content.slice(0, 73)}...</p>
                      </div>
                    </div>
                    <div className="post-footer">
                      <span className="like-count">{post.mentees}명 멘토링 중...</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isModalOpen && selectedPost && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>

            {/* 작성자 이미지 및 정보 */}
            <div className="modal-header">
              <img 
                src={selectedPost.image ? selectedPost.image : '/img/default_img.jpg'} 
                alt="작성자 프로필" 
                className="mentor-icon" 
              />
              {selectedPost.authorName ? (
                <strong>{selectedPost.authorName}</strong>
              ) : (
                <strong>Unknown Author</strong>
              )}
            </div>

            {/* 제목, 카테고리 및 작성 날짜 */}
            <div className="post-title-row">
              <strong>{selectedPost.title}</strong>
              {selectedPost.category !== 0 && (
                <span className="post-category">{jobTitles[selectedPost.category]}</span>
              )}
            </div>
            <p className="post-date" style={{ fontSize: '12px' }}>작성일: {new Date(selectedPost.created_at).toLocaleDateString()}</p>

            {/* 콘텐츠 전체 표시 */}
            <p>{selectedPost.content}</p>

            {/* 첨부된 파일들 표시 */}
            {Array.isArray(selectedPost.files) && selectedPost.files.length > 0 && (
              <div className="attached-files">
                <ul>
                  {selectedPost.files.map((file, index) => {
                    const fileUrl = file && file.url ? file.url : '';
                    const decodedFileName = decodeURIComponent(file.originalName);
                    const originalName = decodedFileName ? decodedFileName : `첨부된 파일 ${index + 1}`;
                    
                    return (
                      <li key={index}>
                        {fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.jpeg') ? (
                          <img src={fileUrl} alt={`첨부된 이미지 ${index}`} className="attached-image" />
                        ) : (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer">{originalName} 다운로드</a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 삭제 및 수정 버튼 (작성자 본인인 경우) */}
            {userId === selectedPost.userId ? (
              <div className="modal-footer">
                <button className="modal-button" onClick={handleUpdatePost}>수정하기</button>
                <button className="modal-button" onClick={handleDeletePost}>삭제하기</button>
              </div>
            ) : (
              <div className="modal-footer">
                <button className="modal-button" onClick={() => handleQuestionClick()}>질문하기</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;