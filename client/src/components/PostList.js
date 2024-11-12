import React, { useState, useEffect } from 'react';
import { fetchPosts, createPost, deletePost } from '../services/postService';
import { fetchUserId } from '../services/authService';
import { createOrGetChatRoom } from '../services/chatRoomService';
import { useNavigate } from 'react-router-dom';
import PostItem from './PostItem';
import PostModal from './PostModal';
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
  const jobTitles = { 1: 'IT/인터넷', 2: '마케팅/광고/홍보', 3: '경영/사무' };

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
      try {
        const posts = await fetchPosts();
        setPosts(posts);
      } catch (error) {
        console.error(error);
      }
    };
    getPosts();
  }, []);

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
        setPosts(posts.filter((post) => post.id !== selectedPost.id));
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

  // 선택된 카테고리와 검색어에 따라 게시물 필터링
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === null || post.category === selectedCategory;
    const matchesSearchTerm = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  return (
    <div>
      <div className="category-buttons">
        <button className={selectedCategory === null ? 'active' : ''} onClick={() => setSelectedCategory(null)}>전체</button>
        <button className={selectedCategory === 1 ? 'active' : ''} onClick={() => setSelectedCategory(1)}>IT/인터넷</button>
        <button className={selectedCategory === 2 ? 'active' : ''} onClick={() => setSelectedCategory(2)}>마케팅/광고/홍보</button>
        <button className={selectedCategory === 3 ? 'active' : ''} onClick={() => setSelectedCategory(3)}>경영/사무</button>
      </div>

      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="post-list">
        {filteredPosts.map((post) => (
          <PostItem key={post.id} post={post} jobTitles={jobTitles} onClick={handlePostClick} />
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