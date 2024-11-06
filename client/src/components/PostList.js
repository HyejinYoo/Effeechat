import React, { useState, useEffect } from 'react'; 
import { fetchPosts, createPost, deletePost, updatePost } from '../services/postService'; // 삭제, 수정 함수 추가
import { fetchUserId } from '../services/authService'; 
import { createOrGetChatRoom } from '../services/chatRoomService';
import { useNavigate } from 'react-router-dom';
import '../styles/PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(null); 
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();

  // 직무 이름을 직무 번호에 맞게 설정
  const jobTitles = {
    1: 'IT/인터넷',
    2: '마케팅/광고/홍보',
    3: '경영/사무',
  };

  // 사용자 ID를 서버에서 가져오기
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await fetchUserId();
        setUserId(userId);
      } catch (error) {
        console.error(error);
      }
    };

    getUserId();
  }, []);

  // 채팅방 목록 가져오기
  useEffect(() => {
    const getPosts = async () => {
      try {
        const posts = await fetchPosts(); // 이미지 포함된 포스트 데이터 가져오기
        setPosts(posts);
      } catch (error) {
        console.error(error);
      }
    };

    getPosts();
  }, []);

  // 포스트 생성
  const handleCreatePost = async () => {
    if (!userId) {
      console.error('User ID is not available.');
      return;
    }

    try {
      const createdPost = await createPost(userId, title, content, category);
      setTitle('');
      setContent('');
      const updatedPosts = await fetchPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error(error);
    }
  };

  // 포스트 클릭 시 전체 내용 보기 (팝업 띄우기)
  const handlePostClick = (post) => {
    setSelectedPost(post); 
    setIsModalOpen(true); 
  };

  // 팝업 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null); 
  };

  // 포스트 삭제
  const handleDeletePost = async () => {
    if (selectedPost && selectedPost.id) {
      try {
        await deletePost(selectedPost.id);
        setIsModalOpen(false);
        const updatedPosts = await fetchPosts();
        setPosts(updatedPosts);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // 포스트 수정 (새 페이지로 이동)
  const handleUpdatePost = () => {
    navigate(`/update/${selectedPost.id}`); // 수정 페이지로 이동
  };

  // 채팅방으로 이동
  const handleQuestionClick = async () => {
    if (!selectedPost || !selectedPost.id || !userId) {
      console.error('Post ID, Mentor ID, or Mentee ID is not available.');
      return;
    }
  
    const postId = selectedPost.id; // 선택된 포스트 ID
    const mentorId = selectedPost.userId; // 게시물 작성자 ID (멘토)
    const menteeId = userId; // 현재 로그인된 사용자 ID (멘티)
  
    try {
      // 서비스에서 채팅방 ID 가져오기
      const chatRoomId = await createOrGetChatRoom(mentorId, menteeId);
      
      // 생성된 방으로 이동
      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error('Failed to create or get chat room:', error);
    }
  };

  // 방 입장 가능 여부 확인 함수
  const canJoinRoom = (isOpen) => isOpen;

  // 카테고리 버튼 클릭 시, 선택된 카테고리만 필터링
  const handleCategoryClick = (categoryId) => setSelectedCategory(categoryId);

  // 카테고리별로 필터링된 포스트 목록을 반환
  const filteredPosts = posts.filter((post) => {
    console.log('Post:', post); // post 객체 확인
    console.log('Post title:', post.title); // title 확인
    console.log('Search term:', searchTerm); // searchTerm 확인
  
    const postTitle = post.title ? post.title.toLowerCase() : ''; // null인지 확인하는 안전 장치
    const matchesSearchTerm = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || post.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div>
      {/* 카테고리 버튼들 */}
      <div className="category-buttons">
        <button className={selectedCategory === null ? 'active' : ''} onClick={() => handleCategoryClick(null)}>전체</button>
        <button className={selectedCategory === 1 ? 'active' : ''} onClick={() => handleCategoryClick(1)}>IT/인터넷</button>
        <button className={selectedCategory === 2 ? 'active' : ''} onClick={() => handleCategoryClick(2)}>마케팅/광고/홍보</button>
        <button className={selectedCategory === 3 ? 'active' : ''} onClick={() => handleCategoryClick(3)}>경영/사무</button>
      </div>

      {/* 검색창 */}
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 채팅방 목록 */}
      <ul className="post-list">
        {filteredPosts.map((post) => (
          <li
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={canJoinRoom(post.is_open) ? 'post-item room-open' : 'post-item room-closed'}
          >
            <div className={`post-content ${post.is_open ? '' : 'closed-room'}`}>
              <div className="post-header">
                <div className="author-info">
                  <img src={post.image ? post.image : '/img/default_img.jpg'} alt="mentor" className="mentor-icon" />
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

export default PostList;