import React, { useState, useEffect } from 'react';
import { fetchPostById, updatePost } from '../services/postService';
import { fetchUserId } from '../services/authService';
import { useNavigate, useParams } from 'react-router-dom';
import categories from '../constants/categories'; // 카테고리 파일 가져오기
import '../styles/UpdatePost.css';

const UpdatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(0);
  const [userId, setUserId] = useState(null);
  const [postUserId, setPostUserId] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [isChatAllowed, setIsChatAllowed] = useState(1); // 채팅 허용 상태 추가


  const { id: postId } = useParams();
  const navigate = useNavigate();

  // 사용자 ID를 서버에서 가져오기
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await fetchUserId();
        setUserId(userId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    getUserId();
  }, []);

  // 포스트 데이터를 서버에서 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await fetchPostById(postId);
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
        setExistingFiles(post.files || []);
        setPostUserId(post.userId);
        setIsOwner(post.userId === userId);
        setIsChatAllowed(post.is_open);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    if (userId) {
      fetchPost();
    }
  }, [postId, userId]);

  // 새 파일 선택 핸들러
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setNewFiles([...newFiles, selectedFile]);
    }
    setShowFileInput(false);
  };

  // 새 이미지 복사/붙여넣기 핸들러
  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        setNewFiles([...newFiles, blob]);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [newFiles]);

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles(existingFiles.filter((file) => file.id !== fileId));
    setDeletedFiles([...deletedFiles, fileId]);
  };

  const handleRemoveNewFile = (index) => {
    const updatedNewFiles = [...newFiles];
    updatedNewFiles.splice(index, 1);
    setNewFiles(updatedNewFiles);
  };

  const handleUpdatePost = async () => {
    if (!userId || !isOwner) {
      console.error('You are not authorized to edit this post.');
      return;
    }

    if (!title || !content) {
      console.error('Title and content are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('isChatAllowed', isChatAllowed); 


      existingFiles.forEach((file) => {
        formData.append('existingFiles[]', file.id);
      });

      deletedFiles.forEach((fileId) => {
        formData.append('deletedFiles[]', fileId);
      });

      newFiles.forEach((file) => {
        formData.append('files', file);
      });

      await updatePost(postId, formData);
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className="create-post-container">
      {isOwner ? (
        <>
          {/* 카테고리 선택란 */}
          <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
            <option value={0}>카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 제목 입력란 */}
          <input
            type="text"
            placeholder="Enter the post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 본문 입력란 */}
          <textarea
            placeholder="Enter the post content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* 기존 파일 및 새 파일 목록 */}
          <div className="files-section">
            <div className="existing-files">
              {existingFiles.map((file) => (
                <div key={file.id} className="file-input-wrapper">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.originalName}
                  </a>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => handleRemoveExistingFile(file.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="file-inputs">
              {newFiles.map((file, index) => (
                <div key={index} className="file-input-wrapper">
                  <span>{file.name || 'Pasted Image'}</span>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => handleRemoveNewFile(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 새 파일 업로드 입력란 */}
          <div className="file-upload-section">
            <button
              type="button"
              className="add-file-btn"
              onClick={() => setShowFileInput(true)}
            >
              + File
            </button>
            {showFileInput && (
              <div className="file-input-wrapper">
                <input type="file" onChange={handleFileChange} />
              </div>
            )}
          </div>

          {/* 채팅 허용 슬라이드 버튼 */}
          <div className="chat-allow-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={isChatAllowed === 1} // 상태가 1이면 체크
                onChange={() => setIsChatAllowed(isChatAllowed === 1 ? 0 : 1)} // 1과 0을 토글
              />
              <span className="slider"></span>
            </label>
            <span>{isChatAllowed === 1 ? '채팅 허용' : '채팅 비허용'}</span>
          </div>

          {/* 수정 버튼 */}
          <button className="create-post-btn" onClick={handleUpdatePost}>
            Update Post
          </button>
        </>
      ) : (
        <p>You are not authorized to edit this post.</p>
      )}
    </div>
  );
};

export default UpdatePost;
