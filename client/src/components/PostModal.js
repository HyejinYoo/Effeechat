import React from 'react';

const PostModal = ({
  post,
  jobTitles,
  userId,
  closeModal,
  handleUpdatePost,
  handleDeletePost,
  handleQuestionClick
}) => (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={closeModal}>&times;</span>
      <div className="modal-header">
        <img
          src={post.image ? post.image : '/img/default_img.jpg'}
          alt="작성자 프로필"
          className="mentor-icon"
        />
        {post.authorName ? (
          <strong>{post.authorName}</strong>
        ) : (
          <strong>Unknown Author</strong>
        )}
      </div>
      <div className="post-title-row">
        <strong>{post.title}</strong>
        {post.category !== 0 && (
          <span className="post-category">{jobTitles[post.category]}</span>
        )}
      </div>
      <p className="post-date" style={{ fontSize: '12px' }}>
        작성일: {new Date(post.created_at).toLocaleDateString()}
      </p>
      <p>{post.content}</p>
      {Array.isArray(post.files) && post.files.length > 0 && (
        <div className="attached-files">
          <ul>
            {post.files.map((file, index) => {
              const fileUrl = file?.url || '';
              const decodedFileName = decodeURIComponent(file.originalName);
              const originalName = decodedFileName || `첨부된 파일 ${index + 1}`;
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
      {userId === post.userId ? (
        <div className="modal-footer">
          <button className="modal-button" onClick={handleUpdatePost}>수정하기</button>
          <button className="modal-button" onClick={handleDeletePost}>삭제하기</button>
        </div>
      ) : (
        <div className="modal-footer">
          <button className="modal-button" onClick={handleQuestionClick}>질문하기</button>
        </div>
      )}
    </div>
  </div>
);

export default PostModal;