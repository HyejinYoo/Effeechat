import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import "../styles/MyPage.css"; // MyPage.css 가져오기

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // 서버와 클라이언트에서 로그아웃 처리
      window.location.href = "/login"; // 로그인 페이지로 리디렉션
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;