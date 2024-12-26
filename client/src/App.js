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
import FindAccount from "./components/FindAccount";
import { fetchUserId } from "./services/authService";
import io from 'socket.io-client';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL;

let socket;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      socket = io(API_URL);
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
          setIsAuthenticated(!!userId);
        } catch {
          setIsAuthenticated(false);
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
            {/* 메인 경로 */}
            <Route
              path="/"
              element={
                <Navigate to="/posts" />
              }
            />
            <Route
              path="/posts"
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
            <Route
              path="/posts/:postId"
              element={
                isAuthenticated ? <PostList /> : <Navigate to="/login" />
              }
            />
            {/* 기타 경로 */}
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/find-account" element={<FindAccount />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App;