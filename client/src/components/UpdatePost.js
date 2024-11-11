import React, { useState, useEffect } from 'react';
import { fetchPostById, updatePost } from '../services/postService'; // 수정용 API 서비스
import { fetchUserId } from '../services/authService';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/UpdatePost.css';  // 스타일 파일 재사용

const UpdatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(0);
  const [userId, setUserId] = useState(null);
  const [postUserId, setPostUserId] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);  // 기존 파일 상태 추가
  const [newFiles, setNewFiles] = useState([]);  // 새로 업로드된 파일 상태 추가
  const [deletedFiles, setDeletedFiles] = useState([]);  // 삭제된 파일 상태 추가
  const [isOwner, setIsOwner] = useState(false); // 작성자 검증
  const [showFileInput, setShowFileInput] = useState(false); // 파일 선택 창 표시 여부 제어

  const { id: postId } = useParams(); // :id 매개변수를 가져옴
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
        const post = await fetchPostById(postId); // 해당 포스트 ID로 데이터 불러오기
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
        setExistingFiles(post.files || []); // 기존 파일 목록 설정
        setPostUserId(post.userId); // 포스트 작성자의 ID를 저장
        setIsOwner(post.userId === userId); // 작성자가 본인인지 확인
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
      setNewFiles([...newFiles, selectedFile]); // 새 파일 목록에 추가
    }
    setShowFileInput(false); // 파일 선택 후 창 숨김
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

  // 복사/붙여넣기 이벤트 추가
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [newFiles]);

  // 기존 파일 삭제 핸들러
  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles(existingFiles.filter((file) => file.id !== fileId)); // 클라이언트에서 제거
    setDeletedFiles([...deletedFiles, fileId]); // 삭제된 파일 ID를 별도로 저장
  };

  // 새 파일 삭제 핸들러
  const handleRemoveNewFile = (index) => {
    const updatedNewFiles = [...newFiles];
    updatedNewFiles.splice(index, 1); // 새 파일 배열에서 파일 제거
    setNewFiles(updatedNewFiles);
  };

  // 포스트 수정
  const handleUpdatePost = async () => {
    if (!userId || !isOwner) {
      console.error('You are not authorized to edit this post.');
      return;
    }

    if (!title || !content) {
      console.error('Title and content are required.');
      return; // 제목이나 내용이 비어 있으면 반환
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);

      // 기존 파일 정보 전송 (개별 파일 ID)
      existingFiles.forEach((file) => {
        formData.append('existingFiles[]', file.id); // 파일 ID를 개별적으로 전송
      });

      // 삭제된 파일 정보 전송 (개별 파일 ID)
      deletedFiles.forEach((fileId) => {
        formData.append('deletedFiles[]', fileId); // 삭제할 파일 ID를 개별적으로 전송
      });

      // 새 파일 정보 전송
      newFiles.forEach((file) => {
        formData.append('files', file); // 새로 추가된 파일 전송
      });

      // 포스트 수정 API 호출
      await updatePost(postId, formData);
      navigate('/'); // 홈으로 이동
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
            placeholder="Enter the post content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* 기존 파일 및 새 파일 목록을 같은 div로 묶음 */}
          <div className="files-section">
            {/* 기존 파일 목록 */}
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

            {/* 새 파일 목록 */}
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