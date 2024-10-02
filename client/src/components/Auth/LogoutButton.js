import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";  // 로그아웃 서비스 함수 불러오기

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // 로그아웃 서비스 호출 (토큰 삭제)
    navigate("/login");  // 로그아웃 후 로그인 페이지로 리디렉션
  };

  return (
    <button onClick={handleLogout}>
      로그아웃
    </button>
  );
};

export default LogoutButton;