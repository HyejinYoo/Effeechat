import React from 'react';

const PostItem = ({ post, jobTitles, onClick }) => (
  <li
    onClick={() => onClick(post)}
    className={post.is_open ? 'post-item room-open' : 'post-item room-closed'}
  >
    <div className={`post-content ${post.is_open ? '' : 'closed-room'}`}>
      <div className="post-header">
        <div className="author-info">
          <img
            src={post.image ? post.image : '/img/default_img.jpg'}
            alt="mentor"
            className="mentor-icon"
          />
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
);

export default PostItem;