import React, { useState, useEffect } from 'react'; 
import { fetchPosts, createPost } from '../services/postService'; 
import { fetchUserId } from '../services/authService'; 
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
      console.log(createdPost);
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

  // 채팅방으로 이동
  const handleQuestionClick = (postId) => {
    navigate(`/chat/${postId}`);
  };

  // 방 입장 가능 여부 확인 함수
  const canJoinRoom = (isOpen) => isOpen;

  // 카테고리 버튼 클릭 시, 선택된 카테고리만 필터링
  const handleCategoryClick = (categoryId) => setSelectedCategory(categoryId);

  // 카테고리별로 필터링된 포스트 목록을 반환
  const filteredPosts = posts.filter((post) => {
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

      {/* 채팅방 목록 */ }
      <ul className="post-list">
        {filteredPosts.map((post) => (
          <li
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={canJoinRoom(post.is_open) ? 'post-item room-open' : 'post-item room-closed'}
          >
            <div className={`post-content ${post.is_open ? '' : 'closed-room'}`}>
              <div className="post-header">
                {/* 이미지와 작성자 이름을 포함하는 컨테이너 */}
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

      {/* 선택된 포스트 팝업 모달 */ }
    
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
              {/* 작성자 이름 표시 */}
              {selectedPost.authorName ? (
                <strong>{selectedPost.authorName}</strong>
              ) : (
                <strong>Unknown Author</strong>
              )}
            </div>

            {/* 제목과 카테고리 */}
            <div className="post-title-row">
              <strong>{selectedPost.title}</strong>
              {selectedPost.category !== 0 && (
                <span className="post-category">{jobTitles[selectedPost.category]}</span>
              )}
            </div>

            {/* 콘텐츠 전체 표시 */}
            <p>{selectedPost.content}</p>
 

            {/* 질문하기 버튼 */}
            <div className="modal-footer">
              <button className="modal-button" onClick={() => handleQuestionClick(selectedPost.id)}>질문하기</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PostList;