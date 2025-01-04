import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NavBar.css"; // CSS 파일 import

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 로그인 상태 관리

  const handleLogout = () => {
    // 로그아웃 로직 (예: 토큰 삭제)
    setIsLoggedIn(false);
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <div className="navbar">
      {/* 로고 */}
      <div className="logo" onClick={() => navigate("/")}>
        <img src="/img/logo.png" alt="서비스 로고" />
        <p>E-ffeeChat</p>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="nav-buttons">
        <button onClick={() => navigate("/")}>멘토 리스트</button>
        <button onClick={() => navigate("/createPost")}>멘토 등록</button>
        <button onClick={() => navigate("/mypage")}>마이페이지</button>
      </div>
    </div>
  );
};

export default Navbar;