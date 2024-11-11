import React, { useState, useEffect } from 'react';
import { fetchPosts, createPost } from '../services/postService'; // 파일 업로드는 createPost에서 처리
import { fetchUserId } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePost.css';  // 스타일 파일 추가

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(0);
  const [userId, setUserId] = useState(null);
  const [files, setFiles] = useState([]);  // 새로 업로드된 파일 상태 추가
  const [showFileInput, setShowFileInput] = useState(false); // 파일 선택 창 표시 여부 제어

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

  // 클립보드 붙여넣기 핸들러 추가
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          setFiles((prevFiles) => [...prevFiles, file]); // 붙여넣은 파일을 파일 목록에 추가
        }
      }
    };

    // 컴포넌트가 마운트될 때 붙여넣기 이벤트 리스너 추가
    window.addEventListener('paste', handlePaste);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  // 새 파일 선택 핸들러
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFiles([...files, selectedFile]); // 새 파일 목록에 추가
    }
    setShowFileInput(false); // 파일 선택 후 창 숨김
  };

  // 새 파일 삭제 핸들러
  const handleRemoveNewFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1); // 새 파일 배열에서 파일 제거
    setFiles(updatedFiles);
  };

  // 포스트 생성
  const handleCreatePost = async () => {
    if (!userId) {
      console.error('User ID is not available.');
      return;
    }

    if (!title || !content) {
      console.error('Title and content are required.');
      return; // 제목이나 내용이 비어 있으면 반환
    }

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);

      // 새 파일 정보 전송
      files.forEach((file) => {
        formData.append('files', file); // 새로 추가된 파일 전송
      });

      // 포스트 생성 API 호출
      await createPost(formData);
      navigate('/'); // 홈으로 이동
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="create-post-container">
      {/* 카테고리 선택란 */}
      <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
        <option value={0}>Category</option>
        <option value={1}>Development</option>
        <option value={2}>Design</option>
        <option value={3}>Marketing</option>
        <option value={4}>Finance</option>
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
        className="post-textarea"
        placeholder="Enter the post content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* 새 파일 목록 */}
      <div className="files-section">
        <div className="file-inputs">
          {files.map((file, index) => (
            <div key={index} className="file-input-wrapper">
              <span>{file.name}</span>
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

      {/* 생성 버튼 */}
      <button className="create-post-btn" onClick={handleCreatePost}>
        Create Post
      </button>
    </div>
  );
};

export default CreatePost;