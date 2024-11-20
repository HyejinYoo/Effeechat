import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import KakaoLogin from "./components/KakaoLogin";
import PostList from "./components/PostList";
import UpdatePost from './components/UpdatePost';
import ChatRoom from "./components/ChatRoom";
import NavBar from "./components/NavBar";
import LogoutButton from "./components/LogoutButton";
import CreatePost from "./components/CreatePost";
import MyPage from "./components/MyPage";
import EmailVerification from "./components/EmailVerification";
import { fetchUserId } from "./services/authService";
import io from 'socket.io-client';  // socket.io-client import
import './styles/App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const API_URL = process.env.REACT_APP_API_URL;  // 환경 변수에서 API URL 가져오기

let socket;  // 전역 소켓 변수

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // 소켓 연결 (한 번만 생성)
    if (!socket) {
      socket = io(API_URL);  // 소켓을 전역적으로 한 번만 연결
      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server:', socket.id);
      });
    }

  }, []);

  useEffect(() => {
    if (isAuthenticated === null) {
      const checkAuthStatus = async () => {
        try {
          const userId = await fetchUserId();
          setIsAuthenticated(!!userId); // userId가 있으면 true, 없으면 false
        } catch {
          setIsAuthenticated(false); // 에러 발생 시 인증되지 않은 상태로 설정
        } finally {
          setLoading(false);
        }
      };
  
      checkAuthStatus();
    }
  }, [isAuthenticated]);


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="page-container">
        <NavBar />
        
        <div className="content">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <PostList /> : <Navigate to="/login" />
              }
            />
            
            <Route
              path="/login"
              element={
                isAuthenticated === false ? <KakaoLogin /> : <Navigate to="/" />
              }
            />

            <Route
              path="/createPost"
              element={
                isAuthenticated === false ? <KakaoLogin /> : <CreatePost />
              }
            />

            <Route
              path="/mypage"
              element={
                isAuthenticated === false ? <KakaoLogin /> : <MyPage />
              }
            />

            <Route path="/logout" element={<LogoutButton />} />
            

            <Route path="/update/:id" element={<UpdatePost />} />

            <Route
              path="/chat/:roomId"
              element={
                isAuthenticated ? <ChatRoom socket={socket} /> : <Navigate to="/login" />
              }
            />

          </Routes>

          <Routes> 
              {/* 기타 경로 */}
              <Route path="/email-verification" element={<EmailVerification />} />
          </Routes>

        </div>
      </div>
    </Router>
  );
}

export default App;