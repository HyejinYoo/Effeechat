import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import KakaoLogin from "./components/Auth/KakaoLogin";
import Dashboard from "./components/ChatRoomList/Dashboard";
import LogoutButton from "./components/Auth/LogoutButton";
import axios from 'axios';  // axios 임포트

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);  // null로 설정 (아직 확인되지 않은 상태)
  const [loading, setLoading] = useState(true);  // 로딩 상태


  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 서버에 로그인 상태 확인 요청 (쿠키 기반)
        const response = await axios.get('http://localhost:3001/auth/check', {
          withCredentials: true,  // 쿠키 전송 허용
        });
        console.log("Auth check response:", response.data);  // 응답 데이터 확인
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);  // 오류가 발생하면 로그인되지 않은 상태로 설정
      } finally {
        setLoading(false);  // 로딩 상태 해제
      }
    };
  
    checkAuthStatus();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // 로딩 중일 때 로딩 화면 표시
  if (loading) {
    return <div>Loading...</div>;
  }

  // 로그인 상태 확인 후 처리
  return (
    <Router>
      <Routes>
        {/* 로그인된 상태가 확인된 후에만 리디렉션을 처리 */}
        <Route
          path="/"
          element={
            isAuthenticated === true ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        
        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={
            isAuthenticated === false ? <KakaoLogin /> : <Navigate to="/" />
          }
        />
        
        {/* 로그아웃 버튼 */}
        <Route path="/logout" element={<LogoutButton />} />
      </Routes>
    </Router>
  );
}

export default App;