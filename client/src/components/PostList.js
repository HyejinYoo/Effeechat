import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPosts, createPost, deletePost } from '../services/postService';
import { fetchUserId } from '../services/authService';
import { createOrGetChatRoom } from '../services/chatRoomService';
import PostItem from './PostItem';
import PostModal from './PostModal';
import categories from '../constants/categories'; // categories 가져오기
import '../styles/PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  const postsPerPage = 10; // 페이지당 게시물 수
  const navigate = useNavigate();
  const { postId } = useParams();

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

  useEffect(() => {
    const getPosts = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        const posts = await fetchPosts();
        setPosts(posts);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };
    getPosts();
  }, []);

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

  const handlePostClick = (post) => {
    navigate(`/posts/${post.id}`);
  };

  const closeModal = () => {
    navigate('/posts');
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
        setPosts(posts.filter((post) => post.id !== selectedPost.id));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

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

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === null || post.category === selectedCategory;
    const matchesSearchTerm = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  // 현재 페이지에 표시할 게시물 계산
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // 페이지 번호 계산
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className='post-list-container'>
      <div className="category-buttons">
        {categories.map((category) => (
          <button
            key={category.id}
            className={selectedCategory === category.id ? 'active' : ''}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="   Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? ( // 로딩 상태일 때 스피너 표시
        <div className="spinner-container">
          <p>Loading posts...</p>
          <img src="/img/spinner.gif" alt="Loading" className="spinner" />
        </div>
      ) : (
        <ul className="post-list-b post-list-home">
          {currentPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post)}
            />
          ))}

          {/* 페이지네이션 버튼 */}
          <li className="pagination-item">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={currentPage === index + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </li>
        </ul>
      )}

      {isModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
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
