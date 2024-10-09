import React, { useState, useEffect } from 'react'; 
import { fetchPosts, createPost } from '../services/postService'; 
import { fetchUserId } from '../services/authService'; 
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(0); 
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 포스트 상태값
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달창 열림 상태

  const navigate = useNavigate();

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
        const posts = await fetchPosts();
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
      // 채팅방 목록 업데이트
      const updatedPosts = await fetchPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error(error);
    }
  };

  // 포스트 클릭 시 전체 내용 보기 (팝업 띄우기)
  const handlePostClick = (post) => {
    setSelectedPost(post); // 선택된 포스트 저장
    setIsModalOpen(true); // 모달창 열기
  };

  // 팝업 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null); // 선택된 포스트 초기화
  };

  // 채팅방으로 이동
  const handleQuestionClick = (postId) => {
    navigate(`/chat/${postId}`); // 채팅방으로 이동
  };

  // 방 입장 가능 여부 확인 함수
  const canJoinRoom = (isOpen) => {
    return isOpen; 
  };

  // 채팅방 검색
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>


        {/* 채팅방 생성 폼 */}
      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 카테고리 선택 드롭다운 */}
        <select
          value={category}
          onChange={(e) => setCategory(Number(e.target.value))}  // 선택된 카테고리를 숫자로 설정
        >  
          <option value={0}>선택안함</option>
          <option value={1}>Development</option>
          <option value={2}>Design</option>
          <option value={3}>Marketing</option>
          <option value={4}>Finance</option>
        </select>

        <button onClick={handleCreatePost}>Create Post</button>
      </div>
    </div>
  );
};

export default CreatePost;