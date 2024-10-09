import React from 'react';
import '../styles/NavBar.css';  // 별도의 CSS 파일을 사용할 경우 import
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

  const navigate = useNavigate();  // useNavigate 훅을 사용하여 navigate 함수 정의

  return (
    <div className="navbar">
      {/* 로고와 서비스 이름 */}
      <div className="logo">
        <img src="/img/logo.jpg" alt="서비스 로고" />
        <h1>E-ffeeChat</h1>
      </div>

      {/* 네비게이션 버튼들 */}
      <div className="nav-buttons">
        <button onClick={() => navigate('/')}>멘토 리스트</button>
        <button onClick={() => navigate('/createPost')}>멘토 등록</button>
        <button onClick={() => navigate('/mypage')}>마이페이지</button>
      </div>
    </div>
  );
};



export default Navbar;