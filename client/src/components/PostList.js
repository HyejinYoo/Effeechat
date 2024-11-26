import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPosts, createPost, deletePost } from '../services/postService';
import { fetchUserId } from '../services/authService';
import { createOrGetChatRoom } from '../services/chatRoomService';
import PostItem from './PostItem';
import PostModal from './PostModal';
import '../styles/PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { postId } = useParams(); // URI에서 postId를 가져옴
  const jobTitles = { 1: 'IT/인터넷', 2: '마케팅/광고/홍보', 3: '경영/사무' };

  // 사용자 ID 가져오기
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

  // 게시물 목록 가져오기
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

  // URI에 포함된 postId에 따라 모달 상태 설정
  useEffect(() => {
    if (postId) {
      const post = posts.find((p) => p.id === Number(postId));
      if (post) {
        setSelectedPost(post);
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(false);
      setSelectedPost(null);
    }
  }, [postId, posts]);

  // 모달 열기
  const handlePostClick = (post) => {
    navigate(`/posts/${post.id}`); // URI에 postId 추가
  };

  // 모달 닫기
  const closeModal = () => {
    navigate('/posts'); // URI에서 postId 제거
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // 게시물 업데이트 핸들러
  const handleUpdatePost = () => {
    if (selectedPost) {
      navigate(`/update/${selectedPost.id}`);
    }
  };

  // 게시물 삭제 핸들러
  const handleDeletePost = async () => {
    if (selectedPost) {
      try {
        await deletePost(selectedPost.id);
        closeModal();
        setPosts(posts.filter((post) => post.id !== selectedPost.id));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // 질문 클릭 핸들러
  const handleQuestionClick = async () => {
    if (selectedPost && selectedPost.userId && userId) {
      try {
        const chatRoomId = await createOrGetChatRoom(selectedPost.userId, userId);
        navigate(`/chat/${chatRoomId}`);
      } catch (error) {
        console.error('Error initiating chat:', error);
      }
    }
  };

  // 선택된 카테고리와 검색어에 따라 게시물 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === null || post.category === selectedCategory;
    const matchesSearchTerm = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  return (
    <div>
      <div className="category-buttons">
        <button
          className={selectedCategory === null ? 'active' : ''}
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </button>
        <button
          className={selectedCategory === 1 ? 'active' : ''}
          onClick={() => setSelectedCategory(1)}
        >
          IT/인터넷
        </button>
        <button
          className={selectedCategory === 2 ? 'active' : ''}
          onClick={() => setSelectedCategory(2)}
        >
          마케팅/광고/홍보
        </button>
        <button
          className={selectedCategory === 3 ? 'active' : ''}
          onClick={() => setSelectedCategory(3)}
        >
          경영/사무
        </button>
      </div>

      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="post-list-b post-list-home">
        {filteredPosts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            jobTitles={jobTitles}
            onClick={() => handlePostClick(post)}
          />
        ))}
      </ul>

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

export default PostList;