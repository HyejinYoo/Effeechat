import React from 'react';
import categories from '../constants/categories'; // 카테고리를 직접 가져옴
import '../styles/PostModal.css';

const PostModal = ({
  post,
  userId,
  closeModal,
  handleUpdatePost,
  handleDeletePost,
  handleQuestionClick,
  is_open,
}) => (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={closeModal}>&times;</span>
      <div className="modal-header">
        <img
          src={post.image ? post.image : '/img/default_img.jpg'}
          alt={post.authorName ? `${post.authorName}의 프로필 이미지` : '기본 프로필 이미지'}
          className="mentor-icon"
        />
        <div className="author-name">
          <strong>{post.authorName || 'Unknown Author'}</strong>
        </div>
      </div>
      <div className="post-box">
        <div className="post-title-row">
          <strong>{post.title || '제목 없음'}</strong>
          {post.category !== 0 && (
            <span className="post-category">
              {categories.find((cat) => cat.id === post.category)?.name || '카테고리 없음'}
            </span>
          )}
        </div>
        <p className="post-date">
          작성일: {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="post-body">
          <p>{post.content}</p>
        </div>
        {Array.isArray(post.files) && post.files.length > 0 ? (
          <div className="attached-files">
            <ul>
              {post.files.map((file, index) => {
                const fileUrl = file?.url || '';
                const decodedFileName = decodeURIComponent(file.originalName || '');
                const originalName = decodedFileName || `첨부된 파일 ${index + 1}`;
                return (
                  <li key={index}>
                    {fileUrl.match(/\.(jpg|png|jpeg)$/i) ? (
                      <img src={fileUrl} alt={`첨부된 이미지 ${index}`} className="attached-image" />
                    ) : (
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        {originalName} 다운로드
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p></p>
        )}
      </div>
      {userId === post.userId ? (
        <div className="modal-footer">
          <button className="modal-button" onClick={handleUpdatePost}>수정하기</button>
          <button className="modal-button" onClick={handleDeletePost}>삭제하기</button>
        </div>
      ) : (
        <div className="modal-footer">
          <button
            className={`modal-button ${!post.is_open ? 'disabled-button' : ''}`} // is_open에 따라 스타일 클래스 적용
            onClick={handleQuestionClick}
            disabled={!post.is_open} // is_open이 false면 버튼 비활성화
            title={!post.is_open ? '질문이 불가능합니다.' : ''} // 비활성화 이유 표시
          >
            질문하기
          </button>
        </div>
      )}
    </div>
  </div>
);

export default PostModal;