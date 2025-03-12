import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NavBar.css"; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/login"); 
  };

  return (
    <div className="navbar">
      {/* 로고 */}
      <div className="logo" onClick={() => navigate("/")}>
        <img src="/img/logo.jpg" alt="서비스 로고" />
        <h1>E-ffeeChat</h1>
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